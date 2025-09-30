import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, usageType, amount, unit = 'recordings' } = await req.json();

    if (!userId || !usageType || amount === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, usageType, amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate usage type
    if (!['session_recording', 'data_storage'].includes(usageType)) {
      return new Response(
        JSON.stringify({ error: "Invalid usage type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current period (start and end of month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if record exists for this period
    const { data: existing, error: fetchError } = await supabase
      .from('usage_records')
      .select('*')
      .eq('user_id', userId)
      .eq('usage_type', usageType)
      .eq('period_start', periodStart.toISOString().split('T')[0])
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('usage_records')
        .update({
          amount: existing.amount + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('usage_records')
        .insert({
          user_id: userId,
          usage_type: usageType,
          amount,
          unit,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Check if user is within limits
    const { data: limitCheck, error: limitError } = await supabase.rpc(
      'check_usage_limit',
      { _user_id: userId, _usage_type: usageType }
    );

    if (limitError) {
      console.error('Error checking usage limit:', limitError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        usage: result,
        withinLimit: limitCheck,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking usage:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

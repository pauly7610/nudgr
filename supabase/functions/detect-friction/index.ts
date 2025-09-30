import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch recent friction events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('friction_events')
      .select('*, sessions(page_url, user_agent)')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (eventsError) throw eventsError;

    // Analyze patterns with AI
    const prompt = `Analyze these friction events and identify:
1. Behavioral anomalies (unusual patterns in user behavior)
2. Critical friction points requiring immediate attention
3. Predictive insights about potential issues

Events data:
${JSON.stringify(recentEvents, null, 2)}

Provide a structured analysis with specific recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert UX analyst specializing in friction detection and behavioral analysis. Provide actionable insights." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    // Calculate aggregate friction scores
    const frictionScores = recentEvents?.reduce((acc: any, event: any) => {
      const page = event.sessions?.page_url || 'unknown';
      if (!acc[page]) {
        acc[page] = { totalScore: 0, count: 0, events: [] };
      }
      acc[page].totalScore += event.severity_score;
      acc[page].count += 1;
      acc[page].events.push({
        type: event.event_type,
        severity: event.severity_score,
        timestamp: event.timestamp,
      });
      return acc;
    }, {});

    const pageScores = Object.entries(frictionScores || {}).map(([page, data]: [string, any]) => ({
      page,
      avgFrictionScore: Math.round(data.totalScore / data.count),
      eventCount: data.count,
      recentEvents: data.events.slice(0, 5),
    })).sort((a, b) => b.avgFrictionScore - a.avgFrictionScore);

    return new Response(
      JSON.stringify({ 
        analysis,
        frictionScores: pageScores,
        totalEvents: recentEvents?.length || 0,
        timestamp: new Date().toISOString(),
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in detect-friction function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

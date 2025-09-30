import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface TrackingEvent {
  type: 'friction' | 'pageview' | 'performance' | 'heatmap';
  sessionId: string;
  timestamp: number;
  data: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      console.error('Invalid API key:', apiKey);
      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const rateLimitKey = `${apiKey}:${Math.floor(Date.now() / 60000)}`;
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('identifier', rateLimitKey)
      .eq('endpoint', 'ingest-events')
      .single();

    if (rateLimitData && rateLimitData.request_count >= keyData.rate_limit_per_minute) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse events
    const { events } = await req.json() as { events: TrackingEvent[] };
    
    if (!events || !Array.isArray(events)) {
      return new Response(
        JSON.stringify({ error: 'Invalid events format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let frictionCount = 0;
    let heatmapCount = 0;
    let performanceCount = 0;

    // Process each event type
    for (const event of events) {
      try {
        switch (event.type) {
          case 'friction':
            await supabase.from('friction_events').insert({
              session_id: event.sessionId,
              event_type: event.data.eventType,
              element_selector: event.data.elementSelector,
              page_url: event.data.pageUrl,
              user_action: event.data.userAction,
              error_message: event.data.errorMessage,
              severity_score: event.data.severityScore || 5,
              metadata: event.data.metadata || {},
              timestamp: new Date(event.timestamp).toISOString(),
            });
            frictionCount++;
            break;

          case 'heatmap':
            await supabase.rpc('upsert_heatmap_data', {
              p_page_url: event.data.pageUrl,
              p_element_selector: event.data.elementSelector,
              p_interaction_type: event.data.interactionType,
              p_friction_score: event.data.frictionScore || 0,
            });
            heatmapCount++;
            break;

          case 'performance':
            await supabase.from('page_performance_metrics').insert({
              page_url: event.data.pageUrl,
              avg_load_time_ms: event.data.loadTime,
              avg_first_contentful_paint_ms: event.data.fcp,
              avg_time_to_interactive_ms: event.data.tti,
              date_bucket: new Date().toISOString().split('T')[0],
            });
            performanceCount++;
            break;
        }
      } catch (eventError) {
        console.error('Error processing event:', event.type, eventError);
      }
    }

    // Update rate limit
    await supabase.from('rate_limits').upsert({
      identifier: rateLimitKey,
      endpoint: 'ingest-events',
      request_count: (rateLimitData?.request_count || 0) + 1,
      window_start: new Date(Math.floor(Date.now() / 60000) * 60000).toISOString(),
    });

    // Update last_used_at for API key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    return new Response(
      JSON.stringify({
        success: true,
        processed: events.length,
        breakdown: {
          friction: frictionCount,
          heatmap: heatmapCount,
          performance: performanceCount,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ingest-events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
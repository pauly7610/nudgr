import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FrictionEvent {
  event_type: string;
  element_selector?: string;
  page_url: string;
  user_action?: string;
  error_message?: string;
  metadata?: any;
}

const calculateFrictionScore = (event: FrictionEvent): number => {
  let score = 0;

  // Base scores by event type
  const eventTypeScores: Record<string, number> = {
    'error': 80,
    'timeout': 70,
    'failed_validation': 60,
    'multiple_attempts': 50,
    'slow_response': 40,
    'confusion': 30,
    'hesitation': 20,
  };

  score += eventTypeScores[event.event_type] || 10;

  // Adjust based on error criticality
  if (event.error_message) {
    if (event.error_message.toLowerCase().includes('fatal') || 
        event.error_message.toLowerCase().includes('critical')) {
      score += 20;
    }
  }

  // Adjust based on element type
  if (event.element_selector) {
    if (event.element_selector.includes('button[type="submit"]') ||
        event.element_selector.includes('form')) {
      score += 15; // Form/submit errors are more critical
    }
  }

  return Math.min(100, score);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { events } = await req.json();

    if (!Array.isArray(events) || events.length === 0) {
      throw new Error("Invalid or empty events array");
    }

    console.log(`Processing ${events.length} friction events`);

    // Score each event and insert into database
    const scoredEvents = events.map((event: FrictionEvent) => ({
      ...event,
      severity_score: calculateFrictionScore(event),
      timestamp: new Date().toISOString(),
    }));

    // Insert friction events
    const { data: insertedEvents, error: insertError } = await supabase
      .from('friction_events')
      .insert(scoredEvents)
      .select();

    if (insertError) {
      console.error('Error inserting friction events:', insertError);
      throw insertError;
    }

    console.log(`Successfully inserted ${insertedEvents?.length} events`);

    // Update heatmap data for aggregation
    for (const event of scoredEvents) {
      if (event.element_selector) {
        const { error: heatmapError } = await supabase.rpc('upsert_heatmap_data', {
          p_page_url: event.page_url,
          p_element_selector: event.element_selector,
          p_interaction_type: event.event_type === 'error' ? 'rage_click' : 'click',
          p_friction_score: event.severity_score,
        }).single();

        if (heatmapError) {
          console.error('Error updating heatmap:', heatmapError);
        }
      }
    }

    // Check for friction spikes and trigger alerts
    const recentHighFriction = scoredEvents.filter((e: any) => e.severity_score >= 70);
    
    if (recentHighFriction.length > 5) {
      console.log(`⚠️ Friction spike detected: ${recentHighFriction.length} high-severity events`);
      
      // Get active alerts for friction spikes
      const { data: activeAlerts } = await supabase
        .from('alerts_config')
        .select('*')
        .eq('alert_type', 'friction_spike')
        .eq('is_active', true);

      // Update last_triggered_at for matched alerts
      if (activeAlerts && activeAlerts.length > 0) {
        for (const alert of activeAlerts) {
          await supabase
            .from('alerts_config')
            .update({ last_triggered_at: new Date().toISOString() })
            .eq('id', alert.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: scoredEvents.length,
        highSeverityCount: recentHighFriction.length,
        averageScore: Math.round(
          scoredEvents.reduce((sum: number, e: any) => sum + e.severity_score, 0) / scoredEvents.length
        ),
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in score-friction function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

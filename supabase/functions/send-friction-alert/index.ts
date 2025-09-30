import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface FrictionAlert {
  eventType: string;
  severityScore: number;
  pageUrl: string;
  errorMessage?: string;
  elementSelector?: string;
  userAction?: string;
  sessionId: string;
  screenshotUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, frictionEvent }: { userId: string; frictionEvent: FrictionAlert } = await req.json();

    if (!userId || !frictionEvent) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's alert configurations
    const { data: alertConfigs } = await supabase
      .from('alerts_config')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (!alertConfigs || alertConfigs.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active alerts configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifications: Promise<any>[] = [];

    for (const config of alertConfigs) {
      // Check if alert conditions match
      const conditions = config.conditions as any;
      if (conditions.minSeverity && frictionEvent.severityScore < conditions.minSeverity) {
        continue;
      }

      if (conditions.eventTypes && !conditions.eventTypes.includes(frictionEvent.eventType)) {
        continue;
      }

      // Send to each notification channel
      const channels = config.notification_channels as string[];
      
      for (const channel of channels) {
        if (channel === 'slack' && conditions.slackWebhookUrl) {
          notifications.push(sendSlackNotification(conditions.slackWebhookUrl, frictionEvent, config));
        } else if (channel === 'webhook' && conditions.webhookUrl) {
          notifications.push(sendWebhookNotification(conditions.webhookUrl, frictionEvent, config));
        } else if (channel === 'email') {
          notifications.push(logEmailNotification(supabase, config, frictionEvent));
        }
      }

      // Update last triggered timestamp
      await supabase
        .from('alerts_config')
        .update({ last_triggered_at: new Date().toISOString() })
        .eq('id', config.id);
    }

    await Promise.allSettled(notifications);

    return new Response(
      JSON.stringify({ success: true, alertsSent: notifications.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending friction alert:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendSlackNotification(webhookUrl: string, event: FrictionAlert, config: any) {
  const severityEmoji = event.severityScore >= 8 ? '🔴' : event.severityScore >= 6 ? '🟡' : '🟢';
  
  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmoji} Friction Alert: ${event.eventType}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${event.severityScore}/10`,
          },
          {
            type: 'mrkdwn',
            text: `*Page:*\n${event.pageUrl}`,
          },
          {
            type: 'mrkdwn',
            text: `*Session:*\n${event.sessionId.slice(0, 8)}`,
          },
          {
            type: 'mrkdwn',
            text: `*Element:*\n${event.elementSelector || 'N/A'}`,
          },
        ],
      },
    ],
  };

  if (event.errorMessage) {
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Error:*\n\`\`\`${event.errorMessage}\`\`\``,
      },
    });
  }

  if (event.screenshotUrl) {
    (message.blocks as any[]).push({
      type: 'image',
      image_url: event.screenshotUrl,
      alt_text: 'Friction screenshot',
    });
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack notification failed: ${response.statusText}`);
  }

  return { channel: 'slack', success: true };
}

async function sendWebhookNotification(webhookUrl: string, event: FrictionAlert, config: any) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alertName: config.name,
      frictionEvent: event,
      timestamp: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook notification failed: ${response.statusText}`);
  }

  return { channel: 'webhook', success: true };
}

async function logEmailNotification(supabase: any, config: any, event: FrictionAlert) {
  // Log email notification (actual email sending would require integration)
  await supabase
    .from('notification_log')
    .insert({
      alert_id: config.id,
      notification_type: 'email',
      recipient: config.metadata?.email || 'admin@example.com',
      subject: `Friction Alert: ${event.eventType}`,
      message: `Severity ${event.severityScore} friction detected on ${event.pageUrl}`,
      status: 'pending',
    });

  return { channel: 'email', success: true };
}

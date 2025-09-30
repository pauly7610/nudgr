import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Webhook, Mail, Bell, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AlertConfig {
  id: string;
  name: string;
  description?: string;
  alert_type: string;
  conditions: {
    minSeverity?: number;
    eventTypes?: string[];
    slackWebhookUrl?: string;
    webhookUrl?: string;
    email?: string;
  };
  notification_channels: string[];
  is_active: boolean;
}

export const SlackIntegration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('slack');

  // Slack config
  const [slackWebhook, setSlackWebhook] = useState('');
  const [slackMinSeverity, setSlackMinSeverity] = useState([7]);
  const [slackEnabled, setSlackEnabled] = useState(false);

  // Webhook config
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMinSeverity, setWebhookMinSeverity] = useState([7]);
  const [webhookEnabled, setWebhookEnabled] = useState(false);

  // Email config
  const [emailAddress, setEmailAddress] = useState('');
  const [emailMinSeverity, setEmailMinSeverity] = useState([7]);
  const [emailEnabled, setEmailEnabled] = useState(false);

  const { data: alerts } = useQuery({
    queryKey: ['alert-configs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('alerts_config')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as AlertConfig[];
    },
    enabled: !!user?.id,
  });

  const saveAlertMutation = useMutation({
    mutationFn: async (config: Partial<AlertConfig>) => {
      if (!user?.id) throw new Error('No user');
      
      const payload: any = {
        name: config.name || '',
        description: config.description,
        alert_type: config.alert_type || 'friction',
        conditions: config.conditions || {},
        notification_channels: config.notification_channels || [],
        is_active: config.is_active ?? false,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('alerts_config')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-configs'] });
      toast({
        title: 'Alert saved',
        description: 'Your alert configuration has been saved',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save alert',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const saveSlackConfig = () => {
    saveAlertMutation.mutate({
      name: 'Slack Friction Alerts',
      description: 'Real-time friction notifications to Slack',
      alert_type: 'friction',
      conditions: {
        minSeverity: slackMinSeverity[0],
        slackWebhookUrl: slackWebhook,
      },
      notification_channels: ['slack'],
      is_active: slackEnabled,
    });
  };

  const saveWebhookConfig = () => {
    saveAlertMutation.mutate({
      name: 'Webhook Friction Alerts',
      description: 'Real-time friction notifications to custom webhook',
      alert_type: 'friction',
      conditions: {
        minSeverity: webhookMinSeverity[0],
        webhookUrl: webhookUrl,
      },
      notification_channels: ['webhook'],
      is_active: webhookEnabled,
    });
  };

  const saveEmailConfig = () => {
    saveAlertMutation.mutate({
      name: 'Email Friction Alerts',
      description: 'Friction notifications via email',
      alert_type: 'friction',
      conditions: {
        minSeverity: emailMinSeverity[0],
        email: emailAddress,
      },
      notification_channels: ['email'],
      is_active: emailEnabled,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Integrations
        </CardTitle>
        <CardDescription>
          Configure real-time notifications for critical friction events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="slack">
              <MessageSquare className="h-4 w-4 mr-2" />
              Slack
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Webhook className="h-4 w-4 mr-2" />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slack" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="slack-enabled">Enable Slack Alerts</Label>
              <Switch
                id="slack-enabled"
                checked={slackEnabled}
                onCheckedChange={setSlackEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
              <Input
                id="slack-webhook"
                type="url"
                placeholder="https://hooks.slack.com/services/..."
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Create a webhook at{' '}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Slack API
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Severity: {slackMinSeverity[0]}</Label>
              <Slider
                value={slackMinSeverity}
                onValueChange={setSlackMinSeverity}
                min={1}
                max={10}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Only send alerts for friction events with severity {slackMinSeverity[0]} or higher
              </p>
            </div>

            <Button onClick={saveSlackConfig} disabled={!slackWebhook || saveAlertMutation.isPending}>
              Save Slack Configuration
            </Button>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-enabled">Enable Webhook Alerts</Label>
              <Switch
                id="webhook-enabled"
                checked={webhookEnabled}
                onCheckedChange={setWebhookEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://your-domain.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                POST requests will be sent to this URL with friction event data
              </p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Severity: {webhookMinSeverity[0]}</Label>
              <Slider
                value={webhookMinSeverity}
                onValueChange={setWebhookMinSeverity}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <Button onClick={saveWebhookConfig} disabled={!webhookUrl || saveAlertMutation.isPending}>
              Save Webhook Configuration
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-enabled">Enable Email Alerts</Label>
              <Switch
                id="email-enabled"
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="alerts@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Minimum Severity: {emailMinSeverity[0]}</Label>
              <Slider
                value={emailMinSeverity}
                onValueChange={setEmailMinSeverity}
                min={1}
                max={10}
                step={1}
              />
            </div>

            <Button onClick={saveEmailConfig} disabled={!emailAddress || saveAlertMutation.isPending}>
              Save Email Configuration
            </Button>
          </TabsContent>
        </Tabs>

        {/* Active Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium">Active Alerts</h4>
            {alerts.filter(a => a.is_active).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{alert.name}</p>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                  {alert.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

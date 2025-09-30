import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { Webhook, Send, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const WebhookTester = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testPayload, setTestPayload] = useState(JSON.stringify({
    event_type: 'rage_click',
    page_url: 'https://example.com/checkout',
    severity_score: 8,
    session_id: 'test-session-123'
  }, null, 2));
  const [isTesting, setIsTesting] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');

  const handleTest = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL required',
        description: 'Please enter a webhook URL to test',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setLastResponse('');

    try {
      const payload = JSON.parse(testPayload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      setLastResponse(`Status: ${response.status} ${response.statusText}\n\nResponse:\n${responseText}`);

      if (response.ok) {
        toast({
          title: 'Webhook test successful',
          description: `Received ${response.status} response`,
        });
      } else {
        toast({
          title: 'Webhook test failed',
          description: `Received ${response.status} response`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setLastResponse(`Error: ${errorMsg}`);
      toast({
        title: 'Webhook test failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
        <CardDescription>
          Test your webhook endpoints without real friction data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-url">Webhook URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://your-domain.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-payload">Test Payload (JSON)</Label>
          <Textarea
            id="test-payload"
            value={testPayload}
            onChange={(e) => setTestPayload(e.target.value)}
            className="font-mono text-sm h-40"
          />
        </div>

        <Button
          onClick={handleTest}
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-pulse" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Request
            </>
          )}
        </Button>

        {lastResponse && (
          <div className="space-y-2">
            <Label>Response</Label>
            <pre className="p-3 bg-muted rounded-lg text-xs overflow-x-auto">
              {lastResponse}
            </pre>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-medium text-blue-900 dark:text-blue-100">Testing Tips</p>
            <ul className="text-blue-800 dark:text-blue-200 text-xs space-y-1 list-disc list-inside">
              <li>Use RequestBin or Webhook.site for quick testing</li>
              <li>Check your server logs for debugging</li>
              <li>Verify CORS settings if testing from browser</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

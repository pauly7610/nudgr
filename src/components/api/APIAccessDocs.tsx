import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink } from 'lucide-react';

export const APIAccessDocs = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/metrics/recent',
      description: 'Retrieve recent friction, performance, and error events for the authenticated user',
      params: [],
    },
    {
      method: 'POST',
      path: '/api/upload-recording',
      description: 'Upload a session recording file (multipart/form-data)',
      params: ['file', 'sessionId', 'userId', 'metadata'],
    },
    {
      method: 'GET',
      path: '/recordings?userId=<id>',
      description: 'Get session recordings list',
      params: ['userId'],
    },
    {
      method: 'POST',
      path: '/api/export-pdf',
      description: 'Generate a PDF export and return a download URL',
      params: ['reportType', 'filters', 'userId'],
    },
    {
      method: 'GET',
      path: '/export-jobs?userId=<id>',
      description: 'List PDF export jobs for the authenticated user',
      params: ['userId'],
    },
    {
      method: 'GET',
      path: '/ws/realtime-dashboard?token=<jwt>',
      description: 'WebSocket endpoint for realtime friction/anomaly updates',
      params: [],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          REST API Access
        </CardTitle>
        <CardDescription>
          Programmatic access to your friction analytics data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Base URL</h3>
            <code className="block p-3 bg-muted rounded-lg text-sm">
              {apiBaseUrl}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include your JWT access token in the request header:
            </p>
            <code className="block p-3 bg-muted rounded-lg text-sm">
              Authorization: Bearer &lt;access_token&gt;
            </code>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Available Endpoints</h3>
          {apiEndpoints.map((endpoint) => (
            <div key={endpoint.path} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono">
                  {endpoint.method}
                </span>
                <code className="text-sm">{endpoint.path}</code>
              </div>
              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              {endpoint.params.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium">Query params:</span>{' '}
                  <code>{endpoint.params.join(', ')}</code>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Example Request</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`curl -X GET \\
  '${apiBaseUrl}/metrics/recent' \\
  -H 'Authorization: Bearer <access_token>'`}</code>
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Example Response</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`{
  "events": [
    { "id": "evt_123", "eventType": "rage_click", "severityScore": 8 }
  ],
  "performance": [
    { "id": "perf_123", "metricName": "LCP", "metricValue": 1800 }
  ],
  "errors": [
    { "id": "err_123", "severity": "critical", "errorMessage": "Checkout timeout" }
  ]
}`}</code>
          </pre>
        </div>

        <Button className="w-full" asChild>
          <a href="/documentation" target="_blank">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full API Documentation
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

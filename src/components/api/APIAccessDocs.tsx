import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, ExternalLink } from 'lucide-react';

export const APIAccessDocs = () => {
  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/friction-events',
      description: 'Retrieve friction events',
      params: ['limit', 'offset', 'start_date', 'end_date'],
    },
    {
      method: 'GET',
      path: '/api/session-recordings',
      description: 'Get session recordings list',
      params: ['limit'],
    },
    {
      method: 'GET',
      path: '/api/heatmaps',
      description: 'Fetch heatmap data',
      params: ['page_url'],
    },
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get summary statistics',
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
              https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/api-access
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include your API key in the request header:
            </p>
            <code className="block p-3 bg-muted rounded-lg text-sm">
              x-api-key: fk_your_api_key_here
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
  'https://nykvaozegqidulsgqrfg.supabase.co/functions/v1/api-access/friction-events?limit=10' \\
  -H 'x-api-key: fk_your_api_key_here'`}</code>
          </pre>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Example Response</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
            <code>{`{
  "data": [
    {
      "id": "uuid",
      "event_type": "rage_click",
      "page_url": "https://example.com",
      "severity_score": 8,
      "created_at": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 10
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

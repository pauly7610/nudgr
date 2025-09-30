import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Zap, Settings, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Documentation = () => {
  return (
    <>
      <DashboardHeader
        title="Documentation"
        description="Learn how to integrate and use the Nudgr friction analytics SDK"
      />

      <div className="container py-8 max-w-5xl">
        <Tabs defaultValue="quickstart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">
              <Zap className="h-4 w-4 mr-2" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="installation">
              <Code className="h-4 w-4 mr-2" />
              Installation
            </TabsTrigger>
            <TabsTrigger value="configuration">
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="examples">
              <Play className="h-4 w-4 mr-2" />
              Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Started in 3 Steps</CardTitle>
                <CardDescription>Begin tracking friction on your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">1. Generate API Key</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to Settings → API Keys and generate a new key
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">2. Add SDK to Your Site</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`<script 
  src="https://your-domain.com/friction-tracker.js" 
  data-api-key="fk_your_api_key_here"
  data-enable-recording="true"
  data-enable-screenshots="true"
></script>`}</code>
                  </pre>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">3. Start Collecting Data</h3>
                  <p className="text-sm text-muted-foreground">
                    The SDK automatically tracks rage clicks, dead clicks, JS errors, form errors, and more
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    💡 Tip: Enable Demo Mode in Settings to explore the dashboard with sample data before installing the SDK
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Installation Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Script Tag (Recommended)</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`<script 
  src="https://your-domain.com/friction-tracker.js" 
  data-api-key="fk_your_api_key_here"
></script>`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">NPM Package (Coming Soon)</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`npm install @nudgr/friction-tracker

import { FrictionTracker } from '@nudgr/friction-tracker';

FrictionTracker.init({
  apiKey: 'fk_your_api_key_here',
  enableRecording: true
});`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
                <CardDescription>Customize the SDK behavior</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-api-key</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>Required.</strong> Your API key from Settings
                    </p>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-enable-recording</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable session recording (true/false). Default: false
                    </p>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-enable-screenshots</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Capture screenshots on friction events (true/false). Default: false
                    </p>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-sample-rate</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recording sample rate (0.0-1.0). Default: 1.0 (100%)
                    </p>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-recording-duration</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Max recording duration in ms. Default: 300000 (5 minutes)
                    </p>
                  </div>

                  <div className="border-l-4 border-muted pl-4">
                    <h4 className="font-mono text-sm font-semibold">data-batch-size</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Events per batch. Default: 10
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Setup</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<script 
  src="/friction-tracker.js" 
  data-api-key="fk_abc123"
></script>`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Full-Featured Setup</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<script 
  src="/friction-tracker.js" 
  data-api-key="fk_abc123"
  data-enable-recording="true"
  data-enable-screenshots="true"
  data-sample-rate="0.5"
  data-recording-duration="180000"
></script>`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Production Setup (Performance Optimized)</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`<script 
  src="/friction-tracker.js" 
  data-api-key="fk_abc123"
  data-enable-recording="true"
  data-sample-rate="0.1"
  data-batch-size="20"
  data-batch-interval="10000"
></script>`}</code>
                  </pre>
                </div>

                <Alert>
                  <AlertDescription>
                    📝 Note: Lower sample rates (e.g., 0.1 = 10%) reduce storage costs while still capturing representative data
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Documentation;

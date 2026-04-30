import { DashboardHeader } from '@/components/DashboardHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Play, Settings, Zap } from 'lucide-react';

const productionSnippet = `<script
  src="https://your-dreamfi-analytics-domain.com/friction-tracker.js"
  data-api-key="fk_your_api_key_here"
  data-endpoint-base="https://your-dreamfi-analytics-domain.com/api"
  data-enable-recording="true"
  data-enable-screenshots="false"
  data-sample-rate="0.1"
></script>`;

const viteExample = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your app</title>

    ${productionSnippet}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const nextExample = `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://your-dreamfi-analytics-domain.com/friction-tracker.js"
          data-api-key="fk_your_api_key_here"
          data-endpoint-base="https://your-dreamfi-analytics-domain.com/api"
          data-enable-recording="true"
          data-enable-screenshots="false"
          data-sample-rate="0.1"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}`;

const Documentation = () => {
  return (
    <>
      <DashboardHeader
        title="Documentation"
        description="Learn how to install and use the DreamFi product analytics tracker"
      />

      <div className="container max-w-5xl py-8">
        <Tabs defaultValue="quickstart" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quickstart">
              <Zap className="mr-2 h-4 w-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="installation">
              <Code className="mr-2 h-4 w-4" />
              Placement
            </TabsTrigger>
            <TabsTrigger value="configuration">
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="examples">
              <Play className="mr-2 h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quickstart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Started In 3 Steps</CardTitle>
                <CardDescription>Begin tracking product friction on a website or web app.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Create a property and key</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to Sites & Apps, create a property for the app/domain/environment, then copy the generated install snippet.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Paste the snippet in the HTML shell</h3>
                  <p className="text-sm text-muted-foreground">
                    The snippet is a browser script. Put it in the shared HTML head or app layout so it loads on every screen you want tracked.
                    It does not go in <code>index.css</code>, <code>index.ts</code>, <code>main.tsx</code>, or a route component.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{productionSnippet}</code>
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Visit the app and verify traffic</h3>
                  <p className="text-sm text-muted-foreground">
                    Open the tracked site, click through a few screens, then return to Sites & Apps and use Verify Install.
                  </p>
                </div>

                <Alert>
                  <AlertDescription>
                    Use Demo Mode in Settings to explore the dashboard before installing the tracker on a real property.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="installation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Where To Put The Snippet</CardTitle>
                <CardDescription>
                  Install it once in the shared browser shell for each website or web app property.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border p-4">
                    <h3 className="font-semibold">React / Vite / SPA</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Paste it in the root <code>index.html</code>, inside <code>{'<head>'}</code>, before <code>{'</head>'}</code>.
                      One install covers all client-side routes because the tracker watches URL changes.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-semibold">Next.js / Remix</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add it to the shared root layout or document head. In Next.js, prefer the <code>Script</code> component with
                      <code> strategy="afterInteractive"</code>.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-semibold">Plain HTML / CMS</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add it to the global header template. If the site has no shared header, paste it before <code>{'</head>'}</code>
                      on every page you want tracked.
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <h3 className="font-semibold">Native Mobile / Desktop</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The browser snippet only works in web pages or webviews. Native app screens should send events through an API or a
                      future native SDK instead.
                    </p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Do not install the script in CSS files, TypeScript entry files, API routes, or individual React components. Those locations
                    either will not execute the browser tracker correctly or will load it multiple times.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Which Screens Should Include It?</CardTitle>
                <CardDescription>Track the surfaces where product behavior and conversion friction matter.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    'Marketing and campaign landing pages',
                    'Signup, login, and onboarding',
                    'Dashboard/home and core product navigation',
                    'Activation, funding, rewards, payments, and support flows',
                    'Staging and production as separate properties',
                    'Separate apps or domains as separate properties',
                  ].map((item) => (
                    <div key={item} className="rounded-md border bg-muted/30 p-3 text-sm">
                      {item}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Keep screenshots disabled on sensitive screens that collect passwords, card numbers, bank details, SSNs, or other regulated
                  information until privacy and compliance approve the capture policy.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
                <CardDescription>Customize tracker behavior per property.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    ['data-api-key', 'Required. The property install key generated in Sites & Apps.'],
                    ['data-endpoint-base', 'Required for hosted installs. The API base URL that receives events, usually ending in /api.'],
                    ['data-enable-recording', 'Enable sampled session recording. Default: false.'],
                    ['data-enable-screenshots', 'Capture screenshots on friction events. Default: false.'],
                    ['data-sample-rate', 'Recording sample rate from 0.0 to 1.0. Use 0.1 for 10%.'],
                    ['data-recording-duration', 'Maximum recording duration in milliseconds. Default: 300000.'],
                    ['data-batch-size', 'Events per network batch. Default: 10.'],
                    ['data-batch-interval', 'Maximum wait between event uploads in milliseconds. Default: 5000.'],
                  ].map(([name, description]) => (
                    <div key={name} className="border-l-4 border-muted pl-4 first:border-primary">
                      <h4 className="font-mono text-sm font-semibold">{name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Copyable Examples</CardTitle>
                <CardDescription>Use the generated snippet from Sites & Apps, then place it using the pattern below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">React / Vite index.html</h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{viteExample}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Next.js App Router</h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{nextExample}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Production, Lower Storage Cost</h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{`<script
  src="https://your-dreamfi-analytics-domain.com/friction-tracker.js"
  data-api-key="fk_abc123"
  data-endpoint-base="https://your-dreamfi-analytics-domain.com/api"
  data-enable-recording="true"
  data-enable-screenshots="false"
  data-sample-rate="0.1"
  data-batch-size="20"
  data-batch-interval="10000"
></script>`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Documentation;

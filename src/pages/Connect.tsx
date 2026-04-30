import { FormEvent, useMemo, useState } from 'react';
import {
  AppWindow,
  CheckCircle2,
  Code2,
  Copy,
  Globe2,
  KeyRound,
  Loader2,
  RefreshCw,
  Signal,
} from 'lucide-react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateAnalyticsProperty,
  useCreatePropertyApiKey,
  useVerifyAnalyticsProperty,
  type AnalyticsProperty,
  type AnalyticsPropertyEnvironment,
  type AnalyticsPropertyType,
} from '@/hooks/useAnalyticsProperties';
import { toast } from '@/hooks/use-toast';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { cn } from '@/lib/utils';

interface InstallState {
  propertyId: string;
  propertyName: string;
  domain: string;
  apiKey: string;
}

const apiBaseUrl = (): string => {
  return (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, '');
};

const trackerUrl = (): string => {
  return `${window.location.origin.replace(/\/$/, '')}/friction-tracker.js`;
};

const buildInstallSnippet = (apiKey: string): string => {
  return `<script
  src="${trackerUrl()}"
  data-api-key="${apiKey}"
  data-endpoint-base="${apiBaseUrl()}/api"
  data-enable-recording="true"
  data-enable-screenshots="false"
  data-sample-rate="0.1"
  data-redact-text="true"
  data-respect-do-not-track="true"
  data-max-queue-size="500"
></script>`;
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'No signal yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const propertyTypeLabel = (value: string): string => {
  return value.replace(/_/g, ' ');
};

const statusTone = (status: string): string => {
  return status === 'connected' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800';
};

const InstallSnippetPanel = ({
  installState,
  onVerify,
  isVerifying,
}: {
  installState: InstallState | null;
  onVerify: (propertyId: string) => void;
  isVerifying: boolean;
}) => {
  const snippet = installState ? buildInstallSnippet(installState.apiKey) : '';

  const copySnippet = async () => {
    if (!snippet) {
      return;
    }

    await navigator.clipboard.writeText(snippet);
    toast({
      title: 'Snippet copied',
      description: 'Paste it in the site HTML head or shared app shell, not in CSS or TS files.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Install Snippet
        </CardTitle>
        <CardDescription>
          Paste this once in the site or app shell and DreamFi will start receiving page views, clicks, errors, friction signals, and sampled recordings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!installState ? (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            Create a site or generate a fresh key from an existing site to reveal the one-time install key.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{installState.propertyName}</Badge>
              <Badge variant="secondary">{installState.domain}</Badge>
            </div>
            <pre className="max-h-72 overflow-auto rounded-md bg-muted p-4 text-xs">
              <code>{snippet}</code>
            </pre>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border bg-muted/40 p-4">
                <h3 className="text-sm font-semibold">Where this goes</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>
                    <strong className="text-foreground">React / Vite:</strong> paste it in the root <code>index.html</code>,
                    inside <code>{'<head>'}</code>, before <code>{'</head>'}</code>.
                  </li>
                  <li>
                    <strong className="text-foreground">Next.js / Remix:</strong> add it to the shared root layout or document head
                    so it renders on every tracked route.
                  </li>
                  <li>
                    <strong className="text-foreground">Plain HTML / CMS:</strong> add it to the global header template. If there is
                    no shared template, add it to each HTML page you want tracked.
                  </li>
                  <li>
                    <strong className="text-foreground">Do not</strong> put it in <code>index.css</code>, <code>index.ts</code>,
                    <code>main.tsx</code>, or an individual React component.
                  </li>
                </ul>
              </div>
              <div className="rounded-md border bg-muted/40 p-4">
                <h3 className="text-sm font-semibold">Which screens to track</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>Install once in a single-page app shell to cover all routed screens automatically.</li>
                  <li>Add it to marketing pages, signup/login, onboarding, dashboard/home, activation, funding, rewards, and support flows.</li>
                  <li>Use separate properties or keys for production, staging, and materially different apps or domains.</li>
                  <li>Keep screenshots off for password, card, bank, SSN, and other sensitive-data screens until privacy review approves them.</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copySnippet}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Snippet
              </Button>
              <Button
                variant="outline"
                onClick={() => onVerify(installState.propertyId)}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Verify Install
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const PropertyCard = ({
  property,
  isSelected,
  isCreatingKey,
  isVerifying,
  onCreateKey,
  onSelect,
  onVerify,
}: {
  property: AnalyticsProperty;
  isSelected: boolean;
  isCreatingKey: boolean;
  isVerifying: boolean;
  onCreateKey: (property: AnalyticsProperty) => void;
  onSelect: (propertyId: string) => void;
  onVerify: (propertyId: string) => void;
}) => {
  return (
    <div className={cn('rounded-md border p-4', isSelected && 'border-primary bg-primary/5')}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold">{property.name}</h3>
            <Badge className={statusTone(property.status)} variant="outline">
              {property.status === 'connected' ? (
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              ) : (
                <Signal className="mr-1 h-3.5 w-3.5" />
              )}
              {property.status === 'connected' ? 'Connected' : 'Awaiting traffic'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              {property.domain}
            </span>
            <span>{property.environment}</span>
            <span>{propertyTypeLabel(property.propertyType)}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{property.eventCount.toLocaleString()} events</span>
            <span>{property.apiKeyCount} keys</span>
            <span>Last signal {formatDate(property.lastSeenAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onSelect(property.id)}>
            View Analytics
          </Button>
          <Button variant="outline" size="sm" onClick={() => onVerify(property.id)} disabled={isVerifying}>
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Verify
          </Button>
          <Button variant="outline" size="sm" onClick={() => onCreateKey(property)} disabled={isCreatingKey}>
            {isCreatingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
            New Key
          </Button>
        </div>
      </div>
    </div>
  );
};

const Connect = () => {
  const {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    isLoading,
  } = useAnalyticsPropertyContext();
  const createProperty = useCreateAnalyticsProperty();
  const createPropertyKey = useCreatePropertyApiKey();
  const verifyProperty = useVerifyAnalyticsProperty();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [propertyType, setPropertyType] = useState<AnalyticsPropertyType>('website');
  const [environment, setEnvironment] = useState<AnalyticsPropertyEnvironment>('production');
  const [installState, setInstallState] = useState<InstallState | null>(null);

  const connectedCount = useMemo(
    () => properties.filter((property) => property.status === 'connected').length,
    [properties]
  );

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createProperty.mutate(
      {
        name,
        domain,
        propertyType,
        environment,
      },
      {
        onSuccess: ({ property, apiKey }) => {
          setInstallState({
            propertyId: property.id,
            propertyName: property.name,
            domain: property.domain,
            apiKey,
          });
          setSelectedPropertyId(property.id);
          setName('');
          setDomain('');
          setPropertyType('website');
          setEnvironment('production');
        },
      }
    );
  };

  const handleCreateKey = (property: AnalyticsProperty) => {
    createPropertyKey.mutate(
      {
        propertyId: property.id,
        keyName: `${property.name} install key`,
      },
      {
        onSuccess: (key) => {
          setInstallState({
            propertyId: property.id,
            propertyName: property.name,
            domain: property.domain,
            apiKey: key.apiKey,
          });
        },
      }
    );
  };

  const handleSelect = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    toast({
      title: 'Analytics view updated',
      description: 'Dashboard charts will use this property filter.',
    });
  };

  return (
    <>
      <DashboardHeader
        title="Sites & Apps"
        description="Create properties, install the tracker, and verify live customer traffic."
      />

      <div className="container max-w-6xl space-y-6 py-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Properties</div>
            <div className="mt-2 text-3xl font-semibold">{properties.length}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Connected</div>
            <div className="mt-2 text-3xl font-semibold">{connectedCount}</div>
          </div>
          <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">Selected View</div>
            <div className="mt-2 truncate text-xl font-semibold">
              {properties.find((property) => property.id === selectedPropertyId)?.name ?? 'All properties'}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AppWindow className="h-5 w-5 text-primary" />
                Connect a Property
              </CardTitle>
              <CardDescription>
                Use one property for each website, web app, mobile app, or environment you want to analyze separately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="property-name">Name</Label>
                  <Input
                    id="property-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Marketing site"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property-domain">Domain</Label>
                  <Input
                    id="property-domain"
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="example.com"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={propertyType} onValueChange={(value) => setPropertyType(value as AnalyticsPropertyType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="web_app">Web app</SelectItem>
                        <SelectItem value="mobile_app">Mobile app</SelectItem>
                        <SelectItem value="desktop_app">Desktop app</SelectItem>
                        <SelectItem value="backend_service">Backend service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Environment</Label>
                    <Select value={environment} onValueChange={(value) => setEnvironment(value as AnalyticsPropertyEnvironment)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="production">Production</SelectItem>
                        <SelectItem value="staging">Staging</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full" type="submit" disabled={createProperty.isPending}>
                  {createProperty.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Create Property & Key
                </Button>
              </form>
            </CardContent>
          </Card>

          <InstallSnippetPanel
            installState={installState}
            onVerify={(propertyId) => verifyProperty.mutate(propertyId)}
            isVerifying={verifyProperty.isPending}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connected Properties</CardTitle>
            <CardDescription>
              Pick the active analytics view, generate replacement install keys, or verify a fresh install.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading properties...
              </div>
            ) : properties.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center">
                <Globe2 className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">No properties yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create the first one to unlock per-site analytics and install verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isSelected={property.id === selectedPropertyId}
                    isCreatingKey={createPropertyKey.isPending}
                    isVerifying={verifyProperty.isPending}
                    onCreateKey={handleCreateKey}
                    onSelect={handleSelect}
                    onVerify={(propertyId) => verifyProperty.mutate(propertyId)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Connect;

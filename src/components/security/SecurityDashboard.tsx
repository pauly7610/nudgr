import { Shield, AlertTriangle, CheckCircle, Key, RefreshCw, RotateCw, LockKeyhole } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRotateApiKey, useSecurityPosture } from '@/hooks/useGovernance';

export const SecurityDashboard = () => {
  const { data: posture, refetch, isFetching } = useSecurityPosture();
  const rotateKey = useRotateApiKey();
  const score = posture?.score ?? 0;

  const scoreTone = score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Security Dashboard</h2>
          <p className="text-muted-foreground">
            API key hygiene, audit history, privacy gaps, and production collection controls.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Collection Security Posture
              </CardTitle>
              <CardDescription>Based on active keys, domain scope, age, and privacy configuration.</CardDescription>
            </div>
            <Badge variant={posture?.posture === 'strong' ? 'default' : posture?.posture === 'needs_review' ? 'secondary' : 'destructive'}>
              {posture?.posture?.replace('_', ' ') ?? 'checking'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-5xl font-bold ${scoreTone}`}>{score}%</div>
            <div className="flex-1">
              <Progress value={score} className="h-2" />
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                <span>{posture?.counts.activeKeys ?? 0} active keys</span>
                <span>{posture?.counts.oldKeys ?? 0} need rotation</span>
                <span>{posture?.counts.unrestrictedKeys ?? 0} unrestricted</span>
                <span>{posture?.counts.privacyGaps ?? 0} privacy gaps</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Key Rotation & Scope
              </CardTitle>
              <CardDescription>Rotate old keys and make sure production keys are pinned to allowed domains.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(posture?.keys ?? []).length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                  No API keys found. Create a site/app property to generate the first install key.
                </div>
              ) : (
                posture?.keys.map((key) => (
                  <div key={key.id} className="grid gap-3 rounded-md border p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{key.keyName}</span>
                        <Badge variant={key.isActive ? 'default' : 'secondary'}>{key.isActive ? 'Active' : 'Inactive'}</Badge>
                        {key.needsRotation && <Badge variant="destructive">Rotate</Badge>}
                        {key.unrestricted && <Badge variant="secondary">No domain scope</Badge>}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {key.keyPrefix}... - {key.ageDays} days old - {key.allowedDomains.length > 0 ? key.allowedDomains.join(', ') : 'all domains'}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!key.isActive || rotateKey.isPending}
                      onClick={() => rotateKey.mutate(key.id)}
                    >
                      <RotateCw className="mr-2 h-4 w-4" />
                      Rotate
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Production Checklist</CardTitle>
              <CardDescription>Security work still visible to a team after install.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(posture?.recommendations ?? []).map((recommendation) => (
                <Alert key={recommendation}>
                  {recommendation.startsWith('Keep') ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
              {!posture && (
                <Alert>
                  <LockKeyhole className="h-4 w-4" />
                  <AlertDescription>Loading security posture...</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <CardDescription>Configuration changes that affect collection and access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(posture?.recentAudit ?? []).length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">No audit activity yet.</p>
              ) : (
                posture?.recentAudit.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <div>
                      <div className="font-medium">{audit.action}</div>
                      <div className="text-xs text-muted-foreground">{audit.targetType}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(audit.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

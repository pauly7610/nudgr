import { useEffect, useState } from 'react';
import { ShieldCheck, Database, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { usePrivacyAudit, usePrivacySettings, useUpdatePrivacySettings } from '@/hooks/useGovernance';

export const DataRetentionPolicy = () => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const propertyId = selectedProperty?.id ?? null;
  const { data: settings, isLoading } = usePrivacySettings(propertyId);
  const { data: audit } = usePrivacyAudit(propertyId, 30);
  const updateSettings = useUpdatePrivacySettings(propertyId);
  const [retentionDays, setRetentionDays] = useState('90');
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [archiveBeforeDelete, setArchiveBeforeDelete] = useState(false);
  const [redactText, setRedactText] = useState(true);
  const [respectDoNotTrack, setRespectDoNotTrack] = useState(true);
  const [requireConsent, setRequireConsent] = useState(false);
  const [allowScreenshots, setAllowScreenshots] = useState(false);
  const [captureQueryString, setCaptureQueryString] = useState(false);
  const [domainAllowlist, setDomainAllowlist] = useState('');

  useEffect(() => {
    if (!settings) {
      return;
    }

    setRetentionDays(String(settings.retentionDays));
    setAutoCleanup(settings.autoCleanup);
    setArchiveBeforeDelete(settings.archiveBeforeDelete);
    setRedactText(settings.redactText);
    setRespectDoNotTrack(settings.respectDoNotTrack);
    setRequireConsent(settings.requireConsent);
    setAllowScreenshots(settings.allowScreenshots);
    setCaptureQueryString(settings.captureQueryString);
    setDomainAllowlist(settings.domainAllowlist.join(', '));
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      retentionDays: Number(retentionDays),
      autoCleanup,
      archiveBeforeDelete,
      redactText,
      respectDoNotTrack,
      requireConsent,
      allowScreenshots,
      captureQueryString,
      domainAllowlist: domainAllowlist
        .split(',')
        .map((domain) => domain.trim())
        .filter(Boolean),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Privacy & Retention Controls
            </CardTitle>
            <CardDescription>
              Set the collection rules a compliance reviewer would ask for before production rollout.
            </CardDescription>
          </div>
          <Badge variant={audit?.risk === 'low' ? 'default' : audit?.risk === 'medium' ? 'secondary' : 'destructive'}>
            {audit ? `${audit.score}% privacy score` : 'Checking'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading privacy controls...
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="retention-period">Retention Period</Label>
                  <Select value={retentionDays} onValueChange={setRetentionDays}>
                    <SelectTrigger id="retention-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                      <SelectItem value="730">730 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain-allowlist">Domain allowlist</Label>
                  <Input
                    id="domain-allowlist"
                    value={domainAllowlist}
                    onChange={(event) => setDomainAllowlist(event.target.value)}
                    placeholder="app.example.com, www.example.com"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Automatic cleanup', autoCleanup, setAutoCleanup],
                    ['Archive before delete', archiveBeforeDelete, setArchiveBeforeDelete],
                    ['Redact page text', redactText, setRedactText],
                    ['Respect Do Not Track', respectDoNotTrack, setRespectDoNotTrack],
                    ['Require consent', requireConsent, setRequireConsent],
                    ['Allow screenshots', allowScreenshots, setAllowScreenshots],
                    ['Capture query string', captureQueryString, setCaptureQueryString],
                  ].map(([label, checked, setter]) => (
                    <div key={label as string} className="flex items-center justify-between rounded-md border p-3">
                      <Label className="text-sm">{label as string}</Label>
                      <Switch
                        checked={checked as boolean}
                        onCheckedChange={setter as (checked: boolean) => void}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    Privacy Audit
                  </div>
                  <Progress value={audit?.score ?? 0} className="mt-3 h-2" />
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Inspected</div>
                      <div className="font-semibold">{audit?.findings.inspectedEvents ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Redacted</div>
                      <div className="font-semibold">{audit?.findings.redactedEvents ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sensitive hits</div>
                      <div className="font-semibold">{audit?.findings.potentialSensitiveMetadata ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Recordings</div>
                      <div className="font-semibold">{audit?.findings.recentRecordings ?? 0}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Current Policy
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Events, errors, recordings, and exports are retained for {retentionDays} days. Text redaction is {redactText ? 'on' : 'off'}, screenshots are {allowScreenshots ? 'allowed' : 'blocked'}, and consent mode is {requireConsent ? 'required' : 'optional'}.
                  </p>
                </div>
              </div>
            </div>

            {audit && audit.recommendations.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Review before sensitive traffic
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {audit.recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={handleSave} disabled={updateSettings.isPending} className="w-full">
              {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Privacy Controls
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

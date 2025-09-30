import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Database, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const DataRetentionPolicy = () => {
  const [retentionDays, setRetentionDays] = useState('90');
  const [autoCleanup, setAutoCleanup] = useState(true);
  const [archiveBeforeDelete, setArchiveBeforeDelete] = useState(true);

  const handleSave = () => {
    localStorage.setItem('data_retention', JSON.stringify({
      retentionDays,
      autoCleanup,
      archiveBeforeDelete,
    }));

    toast({
      title: 'Settings saved',
      description: 'Data retention policy updated successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Retention Policy
        </CardTitle>
        <CardDescription>
          Configure automatic cleanup of old friction data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention-period">Retention Period</Label>
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger id="retention-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days (recommended)</SelectItem>
                <SelectItem value="180">180 days (6 months)</SelectItem>
                <SelectItem value="365">365 days (1 year)</SelectItem>
                <SelectItem value="730">730 days (2 years)</SelectItem>
                <SelectItem value="never">Never delete</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Data older than this period will be automatically deleted
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-cleanup">Automatic Cleanup</Label>
              <p className="text-xs text-muted-foreground">
                Run cleanup automatically on schedule
              </p>
            </div>
            <Switch
              id="auto-cleanup"
              checked={autoCleanup}
              onCheckedChange={setAutoCleanup}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="archive-first">Archive Before Delete</Label>
              <p className="text-xs text-muted-foreground">
                Create backup before permanent deletion
              </p>
            </div>
            <Switch
              id="archive-first"
              checked={archiveBeforeDelete}
              onCheckedChange={setArchiveBeforeDelete}
            />
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Current Policy</p>
              <p className="text-muted-foreground">
                {retentionDays === 'never'
                  ? 'Data will be kept indefinitely'
                  : `Data older than ${retentionDays} days will be deleted`}
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Retention Policy
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Deleted data cannot be recovered</p>
          <p>• Archives are stored for 90 days before permanent deletion</p>
          <p>• Change this policy at any time</p>
        </div>
      </CardContent>
    </Card>
  );
};

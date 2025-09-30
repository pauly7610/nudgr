import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SettingsImportExport = () => {
  const handleExport = () => {
    const settings = {
      widgets: localStorage.getItem('dashboard_widgets'),
      retention: localStorage.getItem('data_retention'),
      onboarding: localStorage.getItem('onboarding_completed'),
      demoMode: localStorage.getItem('demo_mode'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nudgr-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Settings exported',
      description: 'Your configuration has been downloaded',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const settings = JSON.parse(text);

        // Restore settings
        if (settings.widgets) localStorage.setItem('dashboard_widgets', settings.widgets);
        if (settings.retention) localStorage.setItem('data_retention', settings.retention);
        if (settings.onboarding) localStorage.setItem('onboarding_completed', settings.onboarding);
        if (settings.demoMode) localStorage.setItem('demo_mode', settings.demoMode);

        toast({
          title: 'Settings imported',
          description: 'Your configuration has been restored. Reload to apply changes.',
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid settings file',
          variant: 'destructive',
        });
      }
    };

    input.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Import/Export Settings
        </CardTitle>
        <CardDescription>
          Backup and restore your dashboard configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleExport} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          
          <Button onClick={handleImport} variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Import Settings
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Exported settings include:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Dashboard widget configuration</li>
            <li>Data retention policies</li>
            <li>Demo mode preferences</li>
            <li>Onboarding state</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

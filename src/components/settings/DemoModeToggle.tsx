import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DemoModeToggle = () => {
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('demo_mode') === 'true';
  });

  const handleToggle = (enabled: boolean) => {
    setDemoMode(enabled);
    localStorage.setItem('demo_mode', enabled.toString());
    
    // Reload to apply demo data
    if (enabled) {
      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Explore the platform with sample friction data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="demo-mode" className="flex flex-col space-y-1">
            <span>Enable Demo Mode</span>
            <span className="text-sm font-normal text-muted-foreground">
              Load sample data to test features without real traffic
            </span>
          </Label>
          <Switch
            id="demo-mode"
            checked={demoMode}
            onCheckedChange={handleToggle}
          />
        </div>

        {demoMode && (
          <Alert>
            <AlertDescription>
              🎭 Demo mode is active. You're viewing sample friction data across the dashboard.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Sample data includes friction events, sessions, heatmaps, and recordings</p>
          <p>• Perfect for exploring features before installing the SDK</p>
          <p>• Demo data persists until you disable demo mode</p>
        </div>
      </CardContent>
    </Card>
  );
};

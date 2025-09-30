
import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { APIKeysManager } from '@/components/settings/APIKeysManager';

const Settings = () => {
  return (
    <>
      <DashboardHeader title="Settings" description="Configure dashboard preferences, API keys, and notifications" />
      
      <div className="container py-8 space-y-12 max-w-4xl">
        <APIKeysManager />
        
        <Separator />
        <div>
          <h2 className="text-xl font-semibold mb-6">Alert Settings</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Real-time Alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive alerts for friction events as they happen</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Email Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive daily summary of friction events via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Slack Integration</h3>
                <p className="text-sm text-muted-foreground mt-1">Send critical friction alerts to a Slack channel</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-6">Friction Thresholds</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drop-off-threshold">Drop-off Threshold (%)</Label>
                <Input id="drop-off-threshold" type="number" defaultValue="30" min="0" max="100" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rage-click-threshold">Rage Click Threshold (clicks)</Label>
                <Input id="rage-click-threshold" type="number" defaultValue="3" min="1" max="10" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-abandonment-threshold">Form Abandonment Threshold (sec)</Label>
                <Input id="form-abandonment-threshold" type="number" defaultValue="30" min="0" max="300" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nav-loop-threshold">Navigation Loop Threshold (repetitions)</Label>
                <Input id="nav-loop-threshold" type="number" defaultValue="3" min="2" max="10" />
              </div>
            </div>
          </div>
          
          <Button className="mt-6">Save Thresholds</Button>
        </div>
      </div>
    </>
  );
};

export default Settings;

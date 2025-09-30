import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Separator } from '@/components/ui/separator';
import { APIKeysManager } from '@/components/settings/APIKeysManager';
import { SlackIntegration } from '@/components/alerts/SlackIntegration';

const Settings = () => {
  return (
    <>
      <DashboardHeader title="Settings" description="Configure dashboard preferences, API keys, and notifications" />
      
      <div className="container py-8 space-y-12 max-w-4xl">
        <APIKeysManager />
        
        <Separator />
        
        <SlackIntegration />
      </div>
    </>
  );
};

export default Settings;

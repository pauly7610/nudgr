import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Separator } from '@/components/ui/separator';
import { APIKeysManager } from '@/components/settings/APIKeysManager';
import { SlackIntegration } from '@/components/alerts/SlackIntegration';
import { DemoModeToggle } from '@/components/settings/DemoModeToggle';
import { TeamCollaboration } from '@/components/settings/TeamCollaboration';
import { ABTestManager } from '@/components/testing/ABTestManager';
import { APIAccessDocs } from '@/components/api/APIAccessDocs';

const Settings = () => {
  return (
    <>
      <DashboardHeader title="Settings" description="Configure dashboard preferences, API keys, and notifications" />
      
      <div className="container py-8 space-y-12 max-w-4xl">
        <APIKeysManager />
        
        <Separator />
        
        <APIAccessDocs />
        
        <Separator />
        
        <TeamCollaboration />
        
        <Separator />
        
        <ABTestManager />
        
        <Separator />
        
        <DemoModeToggle />
        
        <Separator />
        
        <SlackIntegration />
      </div>
    </>
  );
};

export default Settings;

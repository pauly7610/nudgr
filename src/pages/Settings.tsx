import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Separator } from '@/components/ui/separator';
import { APIKeysManager } from '@/components/settings/APIKeysManager';
import { SlackIntegration } from '@/components/alerts/SlackIntegration';
import { DemoModeToggle } from '@/components/settings/DemoModeToggle';
import { TeamCollaboration } from '@/components/settings/TeamCollaboration';
import { ABTestManager } from '@/components/testing/ABTestManager';
import { APIAccessDocs } from '@/components/api/APIAccessDocs';
import { SystemHealth } from '@/components/system/SystemHealth';
import { WebhookTester } from '@/components/testing/WebhookTester';
import { SDKDebugger } from '@/components/testing/SDKDebugger';
import { DataRetentionPolicy } from '@/components/settings/DataRetentionPolicy';
import { SettingsImportExport } from '@/components/settings/SettingsImportExport';
import { SampleDataGenerator } from '@/components/testing/SampleDataGenerator';

const Settings = () => {
  return (
    <>
      <DashboardHeader title="Settings" description="Configure dashboard preferences, API keys, and notifications" />
      
      <div className="container py-8 space-y-12 max-w-4xl">
        <SystemHealth />
        
        <Separator />
        
        <SettingsImportExport />
        
        <Separator />
        
        <APIKeysManager />
        
        <Separator />
        
        <SDKDebugger />
        
        <Separator />
        
        <WebhookTester />
        
        <Separator />
        
        <APIAccessDocs />
        
        <Separator />
        
        <DataRetentionPolicy />
        
        <Separator />
        
        <TeamCollaboration />
        
        <Separator />
        
        <ABTestManager />
        
        <Separator />
        
        <DemoModeToggle />
        
        <Separator />
        
        <SampleDataGenerator />
        
        <Separator />
        
        <SlackIntegration />
      </div>
    </>
  );
};

export default Settings;

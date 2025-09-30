import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { AIFrictionDetection } from '@/components/analytics/AIFrictionDetection';
import { RealtimeUpdates } from '@/components/analytics/RealtimeUpdates';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { ABTestManager } from '@/components/testing/ABTestManager';
import { TeamCollaboration } from '@/components/settings/TeamCollaboration';
import { DashboardWidgetConfig } from '@/components/dashboard/DashboardWidgetConfig';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Users, Zap, Activity } from 'lucide-react';
import { RateLimitWarning } from '@/components/system/RateLimitWarning';

const Index = () => {
  return (
    <>
      <DashboardHeader 
        title="Dashboard" 
        description="Monitor friction analytics and user experience insights"
      >
        <DashboardWidgetConfig />
      </DashboardHeader>
      
      <RateLimitWarning />
      
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview">
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="ai-analysis">
              <Zap className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            <TabsTrigger value="realtime">
              <Activity className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Live</span>
            </TabsTrigger>
            <TabsTrigger value="ab-tests">
              <TestTube className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="team">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <FrictionDashboard />
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <AIFrictionDetection />
              <PredictiveAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6 mt-6">
            <RealtimeUpdates />
          </TabsContent>
          
          <TabsContent value="ab-tests" className="mt-6">
            <ABTestManager />
          </TabsContent>
          
          <TabsContent value="team" className="mt-6">
            <TeamCollaboration />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Index;

import React from 'react';
import { FrictionDashboard } from '../components/FrictionDashboard';
import { AIFrictionDetection } from '@/components/analytics/AIFrictionDetection';
import { RealtimeUpdates } from '@/components/analytics/RealtimeUpdates';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FrictionDashboard />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AIFrictionDetection />
            <PredictiveAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealtimeUpdates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;

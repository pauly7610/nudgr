
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, UserMinus, BarChart2, Users } from 'lucide-react';
import { MetricComparisonTab } from './MetricComparisonTab';
import { DropOffAnalysisTab } from './DropOffAnalysisTab';
import { VisualAnalyticsTab } from './VisualAnalyticsTab';
import { CollaborativeTab } from './CollaborativeTab';
import { UserCohort, Flow } from '@/data/mockData';

interface ComparisonTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  compareType: string;
  setCompareType: (type: string) => void;
  selectedCohorts: UserCohort[];
  onCohortSelect: (cohortId: string) => void;
  sharedLink: string;
  flow: Flow;
}

export const ComparisonTabs: React.FC<ComparisonTabsProps> = ({
  activeTab,
  setActiveTab,
  compareType,
  setCompareType,
  selectedCohorts,
  onCohortSelect,
  sharedLink,
  flow,
}) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-muted/50 px-4 pt-3 border-b">
          <TabsList>
            <TabsTrigger value="compare" className="flex items-center gap-1">
              <ArrowLeftRight className="h-4 w-4" />
              <span>Metric Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="difference" className="flex items-center gap-1">
              <UserMinus className="h-4 w-4" />
              <span>Drop-off Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4" />
              <span>Visual Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="collaborate" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Collaborate</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="compare" className="p-0">
          <MetricComparisonTab 
            compareType={compareType}
            setCompareType={setCompareType}
            selectedCohorts={selectedCohorts}
            onCohortSelect={onCohortSelect}
          />
        </TabsContent>
        
        <TabsContent value="difference" className="p-0">
          <DropOffAnalysisTab />
        </TabsContent>
        
        <TabsContent value="charts" className="p-0">
          <VisualAnalyticsTab />
        </TabsContent>
        
        <TabsContent value="collaborate" className="p-0">
          <CollaborativeTab 
            sharedLink={sharedLink}
            flow={flow}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

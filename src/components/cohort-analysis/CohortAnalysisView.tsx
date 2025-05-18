
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { FrictionImpactScore } from '@/components/FrictionImpactScore';
import { BarChart2, MousePointer2, Activity } from 'lucide-react';
import { UserCohort, Flow } from '@/data/mockData';

interface CohortAnalysisViewProps {
  cohort: UserCohort;
  flow: Flow | null;
  onShowElementAnalytics: () => void;
  onShowTechErrors: () => void;
  onShowAccessibility: () => void;
  onClose: () => void;
}

export const CohortAnalysisView: React.FC<CohortAnalysisViewProps> = ({
  cohort,
  flow,
  onShowElementAnalytics,
  onShowTechErrors,
  onShowAccessibility,
  onClose
}) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cohort Analysis: {cohort.name}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onShowElementAnalytics}
            >
              <MousePointer2 className="h-4 w-4" />
              <span>Element Analysis</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onShowTechErrors}
            >
              <Activity className="h-4 w-4" />
              <span>Technical Errors</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={onShowAccessibility}
            >
              <Activity className="h-4 w-4" />
              <span>Accessibility</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Journey Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
              <div className="text-center">
                <BarChart2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/70" />
                <p className="text-muted-foreground">Select metrics to visualize cohort performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <FrictionImpactScore flowId={flow?.id} />
      </div>
      
      <div className="mt-6">
        <MarketingFunnelDiagnostics flow={flow} />
      </div>
    </div>
  );
};

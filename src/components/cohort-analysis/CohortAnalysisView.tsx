
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { FrictionImpactScore } from '@/components/FrictionImpactScore';
import { MousePointer2, Activity } from 'lucide-react';
import { UserCohort, Flow } from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

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
  // Generate some sample data based on the cohort
  const performanceData = [
    {
      name: 'Homepage',
      rageClicks: Math.round(cohort.frictionScore * 0.3),
      formAbandonment: Math.round(cohort.frictionScore * 0.2),
      navigationLoops: Math.round(cohort.frictionScore * 0.15),
    },
    {
      name: 'Product Page',
      rageClicks: Math.round(cohort.frictionScore * 0.4),
      formAbandonment: Math.round(cohort.frictionScore * 0.25),
      navigationLoops: Math.round(cohort.frictionScore * 0.1),
    },
    {
      name: 'Checkout',
      rageClicks: Math.round(cohort.frictionScore * 0.6),
      formAbandonment: Math.round(cohort.frictionScore * 0.5),
      navigationLoops: Math.round(cohort.frictionScore * 0.3),
    },
    {
      name: 'Confirmation',
      rageClicks: Math.round(cohort.frictionScore * 0.2),
      formAbandonment: Math.round(cohort.frictionScore * 0.1),
      navigationLoops: Math.round(cohort.frictionScore * 0.05),
    }
  ];

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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rageClicks" name="Rage Clicks" fill="#8884d8" />
                  <Bar dataKey="formAbandonment" name="Form Abandonment" fill="#82ca9d" />
                  <Bar dataKey="navigationLoops" name="Navigation Loops" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
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

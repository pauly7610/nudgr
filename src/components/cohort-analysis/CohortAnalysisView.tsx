
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { FrictionImpactScore } from '@/components/FrictionImpactScore';
import { MousePointer2, Activity, HelpCircle, ArrowLeft } from 'lucide-react';
import { UserCohort, Flow } from '@/data/mockData';
import { ColorLegend } from '@/components/ui/ColorLegend';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
    <div className="mt-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto flex items-center hover:text-primary hover:bg-transparent"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to all cohorts
        </Button>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">{cohort.name}</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Cohort Analysis: {cohort.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Analyze user behavior patterns and friction points for this cohort
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={onShowElementAnalytics}
                >
                  <MousePointer2 className="h-4 w-4" />
                  <span>Element Analysis</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View specific UI elements causing friction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={onShowTechErrors}
                >
                  <Activity className="h-4 w-4" />
                  <span>Technical Errors</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Analyze JavaScript errors and API failures</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={onShowAccessibility}
                >
                  <Activity className="h-4 w-4" />
                  <span>Accessibility</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">View accessibility issues affecting this cohort</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Help card for new users */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Understanding Cohort Analysis</h3>
              <p className="text-sm text-blue-700">
                This view shows friction metrics for the <strong>{cohort.name}</strong> cohort. 
                Use the buttons above to dig deeper into specific issues. The Journey Performance chart 
                below shows three key friction indicators across different pages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Legend */}
      <ColorLegend className="mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Journey Performance</CardTitle>
            <CardDescription>
              Friction indicators across journey stages for {cohort.name}
            </CardDescription>
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
                  <RechartsTooltip formatter={(value, name) => [`${value} instances`, name]} />
                  <Legend />
                  <Bar dataKey="rageClicks" name="Rage Clicks" fill="#8884d8" />
                  <Bar dataKey="formAbandonment" name="Form Abandonment" fill="#82ca9d" />
                  <Bar dataKey="navigationLoops" name="Navigation Loops" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                <strong>What this means:</strong> This chart shows friction indicators across different stages 
                of the user journey. Higher bars indicate more significant issues affecting conversion.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <FrictionImpactScore flowId={flow?.id} />
      </div>
      
      <div className="mt-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Marketing Funnel Diagnostics</CardTitle>
            <CardDescription>
              Analysis of drop-offs through the conversion funnel
            </CardDescription>
          </CardHeader>
        </Card>
        <MarketingFunnelDiagnostics flow={flow} />
      </div>
    </div>
  );
};

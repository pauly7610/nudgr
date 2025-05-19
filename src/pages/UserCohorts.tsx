
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useFrictionData } from '@/hooks/useFrictionData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCohortsList } from '@/components/UserCohortsList';
import { CohortAnalysisView } from '@/components/cohort-analysis/CohortAnalysisView';
import { ElementAnalysisView } from '@/components/cohort-analysis/ElementAnalysisView';
import { TechErrorsView } from '@/components/cohort-analysis/TechErrorsView';
import { AccessibilityView } from '@/components/cohort-analysis/AccessibilityView';
import { CohortComparison } from '@/components/comparison/CohortComparison';
import { MarketingExport } from '@/components/marketing/MarketingExport';
import { ElementInteractionAnalysis } from '@/components/element/ElementInteractionAnalysis';
import { ColorLegend } from '@/components/ui/ColorLegend';
import { UserPlus, Tag, MousePointer2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UserCohorts = () => {
  const { toast } = useToast();
  const { userCohorts, flows } = useFrictionData();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showElementAnalytics, setShowElementAnalytics] = useState<boolean>(false);
  const [showTechErrors, setShowTechErrors] = useState<boolean>(false);
  const [showAccessibility, setShowAccessibility] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);
  
  // Find selected cohort object
  const activeCohort = userCohorts.find(c => c.id === selectedCohort);
  
  // Find related flow (in a real app this would be from actual data)
  const flow = selectedCohort ? flows[0] : null;
  
  const handleSelectCohort = (cohortId: string) => {
    setSelectedCohort(cohortId);
    setShowElementAnalytics(false);
    setShowTechErrors(false);
    setShowAccessibility(false);
    
    toast({
      title: "Cohort Selected",
      description: `Analyzing cohort data for deeper insights`,
    });
  };
  
  const handleViewElementAnalytics = (cohortId: string) => {
    setSelectedCohort(cohortId);
    setShowElementAnalytics(true);
    setShowTechErrors(false);
    setShowAccessibility(false);
    
    toast({
      title: "Element Analysis",
      description: "Displaying element friction analytics for this cohort",
    });
  };

  const handleCloseAnalysis = () => {
    setSelectedCohort(null);
  };

  const dismissHelp = () => {
    setShowHelp(false);
  };
  
  return (
    <>
      <DashboardHeader title="Audience Cohorts" description="Compare metrics across different visitor segments" />
      
      <div className="container py-8">
        {/* Help card for new users */}
        {showHelp && !selectedCohort && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 mb-1">Getting Started with Audience Cohorts</h3>
                  <p className="text-sm text-blue-700">
                    Cohorts group your visitors based on shared characteristics. Select a cohort card 
                    to view detailed friction analytics or use the tabs to filter different cohort types.
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                  onClick={dismissHelp}
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Cohorts</h2>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>New Cohort</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Create a new visitor segment for analysis</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <TabsList>
              <TabsTrigger value="all">All Cohorts</TabsTrigger>
              <TabsTrigger value="marketing" className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                <span>Marketing Cohorts</span>
              </TabsTrigger>
              <TabsTrigger value="element" className="flex items-center gap-1">
                <MousePointer2 className="h-3.5 w-3.5" />
                <span>Element Friction</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-muted-foreground">
              {activeTab === "all" && "Showing all user cohorts"}
              {activeTab === "marketing" && "Filtered to show marketing-related cohorts"}
              {activeTab === "element" && "Filtered to show cohorts with element-level friction"}
            </div>
          </div>
        </Tabs>
        
        {!selectedCohort && (
          <ColorLegend className="mb-6" />
        )}
        
        <UserCohortsList 
          cohorts={userCohorts} 
          activeTab={activeTab} 
          onSelectCohort={handleSelectCohort}
          onViewElementAnalytics={handleViewElementAnalytics}
        />
        
        {/* Show the appropriate view based on state */}
        {activeCohort && !showElementAnalytics && !showTechErrors && !showAccessibility && (
          <CohortAnalysisView
            cohort={activeCohort}
            flow={flow}
            onShowElementAnalytics={() => setShowElementAnalytics(true)}
            onShowTechErrors={() => setShowTechErrors(true)}
            onShowAccessibility={() => setShowAccessibility(true)}
            onClose={handleCloseAnalysis}
          />
        )}
        
        {activeCohort && showElementAnalytics && (
          <ElementAnalysisView
            cohort={activeCohort}
            onBack={() => setShowElementAnalytics(false)}
          />
        )}
        
        {activeCohort && showTechErrors && (
          <TechErrorsView
            cohort={activeCohort}
            onBack={() => setShowTechErrors(false)}
          />
        )}
        
        {activeCohort && showAccessibility && (
          <AccessibilityView
            cohort={activeCohort}
            onBack={() => setShowAccessibility(false)}
          />
        )}
        
        {/* Show comparison view when no cohort is selected */}
        {!activeCohort && !selectedCohort && (
          <CohortComparison />
        )}
        
        {/* Marketing export and element analysis based on active tab */}
        {activeTab === "marketing" && !selectedCohort && (
          <MarketingExport />
        )}
        
        {activeTab === "element" && !selectedCohort && (
          <ElementInteractionAnalysis />
        )}
      </div>
    </>
  );
};

export default UserCohorts;

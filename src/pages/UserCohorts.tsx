
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
import { Filter, UserPlus, Tag, MousePointer2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserCohorts = () => {
  const { toast } = useToast();
  const { userCohorts, flows } = useFrictionData();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showElementAnalytics, setShowElementAnalytics] = useState<boolean>(false);
  const [showTechErrors, setShowTechErrors] = useState<boolean>(false);
  const [showAccessibility, setShowAccessibility] = useState<boolean>(false);
  
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
  
  return (
    <>
      <DashboardHeader title="User Cohorts" description="Compare metrics across different user segments" />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Cohorts</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>New Cohort</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
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
        </Tabs>
        
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

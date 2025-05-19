
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useFrictionData } from '@/hooks/useFrictionData';
import { JourneyCreator } from '@/components/JourneyCreator';
import { CohortFilter } from '@/components/CohortFilter';
import { ScopeFilter } from '@/components/journey/FrictionScopeFilter';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JourneyMapHeader } from '@/components/journey/JourneyMapHeader';
import { JourneySelector } from '@/components/journey/JourneySelector';
import { JourneyOverview } from '@/components/journey/JourneyOverview';
import { JourneyTabContent } from '@/components/journey/JourneyTabContent';

const JourneyMap = () => {
  const { flows, activeFlowId, setActiveFlowId, userCohorts } = useFrictionData();
  const activeFlow = flows.find(f => f.id === activeFlowId) || null;
  const [viewMode, setViewMode] = useState<'detail' | 'overview'>('detail');
  const [showCreator, setShowCreator] = useState(false);
  const [showCohortFilter, setShowCohortFilter] = useState(false);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [compareScope, setCompareScope] = useState<boolean>(false);
  const [scopeA, setScopeA] = useState<ScopeFilter>({});
  const [scopeB, setScopeB] = useState<ScopeFilter>({});
  const [journeyExpanded, setJourneyExpanded] = useState<boolean>(false);
  
  // When activeFlow changes, auto-expand
  useEffect(() => {
    if (activeFlow) {
      setJourneyExpanded(true);
    }
  }, [activeFlow]);
  
  return (
    <>
      <DashboardHeader title="Journey Friction Map" description="Visualize visitor paths and identify friction points">
        <JourneyMapHeader 
          onNewJourney={() => setShowCreator(true)} 
          onFilterClick={() => setShowCohortFilter(true)} 
        />
      </DashboardHeader>
      
      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <JourneySelector
            flows={flows}
            activeFlow={activeFlow}
            setActiveFlowId={setActiveFlowId}
            viewMode={viewMode}
            setViewMode={setViewMode}
            compareScope={compareScope}
            setCompareScope={setCompareScope}
          />
          
          {/* Display journey overview when no active flow is selected */}
          {!activeFlow ? (
            <JourneyOverview flows={flows} setActiveFlowId={setActiveFlowId} />
          ) : (
            <Tabs defaultValue="journey" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="journey">Journey Map</TabsTrigger>
                <TabsTrigger value="sessions">Session Recordings</TabsTrigger>
                <TabsTrigger value="testing">Test Planning</TabsTrigger>
                <TabsTrigger value="analytics">Marketing Analytics</TabsTrigger>
                <TabsTrigger value="annotations">Annotations</TabsTrigger>
              </TabsList>
              
              <JourneyTabContent
                activeFlow={activeFlow}
                flows={flows}
                activeFlowId={activeFlowId}
                activeCohortId={activeCohortId}
                compareScope={compareScope}
                journeyExpanded={journeyExpanded}
                setJourneyExpanded={setJourneyExpanded}
                scopeA={scopeA}
                scopeB={scopeB}
              />
            </Tabs>
          )}
        </div>
      </div>
      
      {showCreator && (
        <JourneyCreator onClose={() => setShowCreator(false)} onCreated={(flowId) => {
          setShowCreator(false);
          setActiveFlowId(flowId);
        }} />
      )}
      
      {showCohortFilter && (
        <CohortFilter 
          cohorts={userCohorts}
          activeCohortId={activeCohortId}
          onSelect={setActiveCohortId}
          onClose={() => setShowCohortFilter(false)}
        />
      )}
    </>
  );
};

export default JourneyMap;

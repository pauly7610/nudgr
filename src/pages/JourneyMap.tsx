
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
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [showHelp, setShowHelp] = useState<boolean>(!localStorage.getItem('journeyMapHelpDismissed'));
  
  // When activeFlow changes, auto-expand
  useEffect(() => {
    if (activeFlow) {
      setJourneyExpanded(true);
    }
  }, [activeFlow]);

  // Helper function to dismiss help
  const dismissHelp = () => {
    localStorage.setItem('journeyMapHelpDismissed', 'true');
    setShowHelp(false);
  };
  
  return (
    <>
      <DashboardHeader title="Journey Friction Map" description="Visualize visitor paths and identify friction points">
        <JourneyMapHeader 
          onNewJourney={() => setShowCreator(true)} 
          onFilterClick={() => setShowCohortFilter(true)} 
        />
      </DashboardHeader>
      
      <div className="container py-8 space-y-8">
        {showHelp && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
            <button 
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-700"
              onClick={dismissHelp}
            >
              ×
            </button>
            <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Info className="h-5 w-5" />
              Welcome to Journey Friction Map
            </h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>This tool helps you visualize and analyze user journeys through your website or app.</p>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Start by selecting a journey from the dropdown below</li>
                <li>Explore the step-by-step visualization to identify friction points</li>
                <li>Use the tabs to access session recordings, test planning, and more</li>
                <li>Toggle between detailed and overview modes using the buttons above</li>
              </ol>
            </div>
          </div>
        )}
      
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
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Getting Started
                </h3>
                <p className="text-sm">Please select a journey from the dropdown above to view detailed analytics and friction points.</p>
              </div>
              <JourneyOverview flows={flows} setActiveFlowId={setActiveFlowId} />
            </div>
          ) : (
            <Tabs defaultValue="journey" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="journey">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Journey Map</TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">Visualize user flow and identify friction points</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
                <TabsTrigger value="sessions">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Session Recordings</TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">Watch actual user sessions to understand behavior</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
                <TabsTrigger value="testing">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Test Planning</TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">Create A/B tests to address friction issues</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Marketing Analytics</TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">Analyze channel performance and conversion rates</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
                <TabsTrigger value="annotations">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Annotations</TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-sm">Add notes and share insights with your team</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsTrigger>
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

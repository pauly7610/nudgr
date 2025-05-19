
import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { FrictionScopeFilter } from './journey/FrictionScopeFilter';
import { MarketingAttributionPanel } from './journey/MarketingAttributionPanel';
import { JourneyHeader } from './journey/JourneyHeader';
import { NoDataMessage } from './journey/NoDataMessage';
import { JourneyVisualization } from './journey/JourneyVisualization';
import { useJourneyFiltering } from '../hooks/useJourneyFiltering';
import { getMockDetailedJourney, getMockMarketingData } from './journey/MockJourneyData';
import { ChevronDown, ChevronUp, Info, Map, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface JourneyFrictionMapProps {
  flow: Flow | null;
  cohortId?: string | null;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export const JourneyFrictionMap: React.FC<JourneyFrictionMapProps> = ({ 
  flow, 
  cohortId,
  expanded = true,
  onToggleExpand
}) => {
  const {
    showMarketingData,
    setShowMarketingData,
    expandedStepIndex,
    setExpandedStepIndex,
    scopeFilter,
    setScopeFilter,
    showScopeFilter,
    setShowScopeFilter,
    hasFiltersApplied,
    filteredSteps
  } = useJourneyFiltering(flow);
  
  // New state to track if user has viewed the help tooltip
  const [helpDismissed, setHelpDismissed] = useState(false);

  if (!flow) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Journey Selected</h3>
        <p className="text-muted-foreground mb-4">
          Please select a journey from the dropdown menu above to view its friction map.
        </p>
      </div>
    );
  }

  // Get detailed journey for current flow
  const detailedJourney = getMockDetailedJourney(flow.id)[flow.id] || [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{flow.flow}</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This journey map shows the flow of users through your selected funnel, highlighting drop-off points and friction areas.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {onToggleExpand && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onToggleExpand}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {expanded ? "Collapse journey details" : "Expand journey details"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {expanded && (
        <>
          {!helpDismissed && (
            <Alert className="mx-6 mt-4 mb-2 bg-blue-50/50 border-blue-200">
              <HelpCircle className="h-4 w-4 text-blue-500" />
              <AlertTitle>Journey Friction Map Guide</AlertTitle>
              <AlertDescription>
                <p className="mb-2">This map shows how users progress through each step of your journey, with drop-off rates and friction points highlighted.</p>
                <ul className="list-disc pl-5 text-sm mb-2">
                  <li>Use <strong>View Dimension</strong> to analyze different aspects of the journey</li>
                  <li>Toggle <strong>Marketing Attribution</strong> to see traffic sources</li>
                  <li>Enable <strong>Scope Filter</strong> to narrow down by user segment</li>
                  <li>Click on any step to see detailed friction analytics</li>
                </ul>
                <button 
                  onClick={() => setHelpDismissed(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Dismiss this guide
                </button>
              </AlertDescription>
            </Alert>
          )}
          
          <JourneyHeader
            flowTitle={flow.flow}
            showScopeFilter={showScopeFilter}
            showMarketingData={showMarketingData}
            toggleScopeFilter={() => setShowScopeFilter(!showScopeFilter)}
            toggleMarketingData={() => setShowMarketingData(!showMarketingData)}
          />
          
          {showMarketingData && <MarketingAttributionPanel marketingData={getMockMarketingData()} />}
          
          {showScopeFilter && (
            <div className="px-6 pt-4">
              <FrictionScopeFilter 
                filter={scopeFilter}
                onFilterChange={setScopeFilter}
                onReset={() => setScopeFilter({})}
              />
            </div>
          )}
          
          {hasFiltersApplied && filteredSteps.length === 0 && (
            <NoDataMessage />
          )}
          
          <JourneyVisualization 
            steps={hasFiltersApplied ? filteredSteps : flow.steps}
            hasFiltersApplied={hasFiltersApplied}
            expandedStepIndex={expandedStepIndex}
            setExpandedStepIndex={setExpandedStepIndex}
            detailedJourney={detailedJourney}
          />
        </>
      )}
    </div>
  );
};

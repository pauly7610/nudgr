
import React from 'react';
import { Flow } from '../data/mockData';
import { FrictionScopeFilter } from './journey/FrictionScopeFilter';
import { MarketingAttributionPanel } from './journey/MarketingAttributionPanel';
import { JourneyHeader } from './journey/JourneyHeader';
import { NoDataMessage } from './journey/NoDataMessage';
import { JourneyVisualization } from './journey/JourneyVisualization';
import { useJourneyFiltering } from '../hooks/useJourneyFiltering';
import { getMockDetailedJourney, getMockMarketingData } from './journey/MockJourneyData';
import { ChevronDown, ChevronUp, Map } from 'lucide-react';

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

  if (!flow) {
    return null; // Return null to prevent empty space when no journey is selected
  }

  // Get detailed journey for current flow
  const detailedJourney = getMockDetailedJourney(flow.id)[flow.id] || [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
        <h3 className="font-semibold">{flow.flow}</h3>
        
        {onToggleExpand && (
          <button 
            onClick={onToggleExpand}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {expanded && (
        <>
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

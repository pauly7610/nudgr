import React from 'react';
import { Flow } from '../data/mockData';
import { FrictionScopeFilter } from './journey/FrictionScopeFilter';
import { MarketingAttributionPanel } from './journey/MarketingAttributionPanel';
import { JourneyHeader } from './journey/JourneyHeader';
import { NoDataMessage } from './journey/NoDataMessage';
import { JourneyVisualization } from './journey/JourneyVisualization';
import { useJourneyFiltering } from '../hooks/useJourneyFiltering';
import { getMockDetailedJourney, getMockMarketingData } from './journey/MockJourneyData';

interface JourneyFrictionMapProps {
  flow: Flow | null;
  cohortId?: string | null;
}

export const JourneyFrictionMap: React.FC<JourneyFrictionMapProps> = ({ flow, cohortId }) => {
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
    return (
      <div className="rounded-lg border bg-card h-96 flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Select a Journey to View</h3>
          <p className="text-muted-foreground">Click on any flow in the dashboard to view its journey friction map</p>
        </div>
      </div>
    );
  }

  // Get detailed journey for current flow
  const detailedJourney = getMockDetailedJourney(flow.id)[flow.id] || [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
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
    </div>
  );
};

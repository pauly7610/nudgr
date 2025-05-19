
import React from 'react';
import { Flow } from '@/data/mockData';
import { JourneyFrictionMap } from '@/components/JourneyFrictionMap';
import { JourneyAnalysisPanel } from '@/components/JourneyAnalysisPanel';
import { JourneyComparisonPanel } from '@/components/JourneyComparisonPanel';
import { JourneyHistoricalTrends } from '@/components/JourneyHistoricalTrends';
import { JourneyAnnotations } from '@/components/JourneyAnnotations';
import { SessionRecordings } from '@/components/SessionRecordings';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { SmartTestPlanner } from '@/components/testing/SmartTestPlanner';
import { SmartActionNudges } from '@/components/SmartActionNudges';
import { TabsContent } from '@/components/ui/tabs';
import { ScopeFilter } from '@/components/journey/FrictionScopeFilter';

interface JourneyTabContentProps {
  activeFlow: Flow | null;
  flows: Flow[];
  activeFlowId: string | null;
  activeCohortId: string | null;
  compareScope: boolean;
  journeyExpanded: boolean;
  setJourneyExpanded: (expanded: boolean) => void;
  scopeA: ScopeFilter;
  scopeB: ScopeFilter;
}

export const JourneyTabContent: React.FC<JourneyTabContentProps> = ({
  activeFlow,
  flows,
  activeFlowId,
  activeCohortId,
  compareScope,
  journeyExpanded,
  setJourneyExpanded,
  scopeA,
  scopeB
}) => {
  if (!activeFlow) return null;
  
  return (
    <>
      <TabsContent value="journey" className="space-y-6">
        {!compareScope ? (
          <>
            <JourneyFrictionMap 
              flow={activeFlow}
              cohortId={activeCohortId}
              expanded={journeyExpanded}
              onToggleExpand={() => setJourneyExpanded(!journeyExpanded)}
            />
            
            {activeFlow && journeyExpanded && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MarketingFunnelDiagnostics flow={activeFlow} />
                  <JourneyAnalysisPanel flow={activeFlow} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SmartActionNudges flowId={activeFlow?.id} />
                </div>
                
                <JourneyComparisonPanel flows={flows} activeFlowId={activeFlowId} />
                
                <JourneyHistoricalTrends flow={activeFlow} />
              </>
            )}
          </>
        ) : (
          <>
            {/* Comparison view */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Scope A</h3>
                <JourneyFrictionMap 
                  flow={activeFlow} 
                  cohortId={activeCohortId} 
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Scope B</h3>
                <JourneyFrictionMap 
                  flow={activeFlow} 
                  cohortId={activeCohortId} 
                />
              </div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              <h3 className="font-medium mb-3">Comparison Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card p-4 rounded border">
                  <div className="text-sm text-muted-foreground mb-1">Drop-off Difference</div>
                  <div className="text-xl font-medium">-12.4%</div>
                  <div className="text-xs text-green-600 mt-1">Scope B performs better</div>
                </div>
                <div className="bg-card p-4 rounded border">
                  <div className="text-sm text-muted-foreground mb-1">Friction Points</div>
                  <div className="text-xl font-medium">3 vs 1</div>
                  <div className="text-xs text-amber-600 mt-1">Scope A has more friction</div>
                </div>
                <div className="bg-card p-4 rounded border">
                  <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
                  <div className="text-xl font-medium">+8.7%</div>
                  <div className="text-xs text-green-600 mt-1">Scope B has higher conversion</div>
                </div>
              </div>
            </div>
          </>
        )}
      </TabsContent>
      
      <TabsContent value="sessions">
        <SessionRecordings flow={activeFlow} />
      </TabsContent>
      
      <TabsContent value="testing">
        <div className="mb-6">
          <SmartTestPlanner flowId={activeFlow?.id} />
        </div>
      </TabsContent>
      
      <TabsContent value="analytics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MarketingFunnelDiagnostics flow={activeFlow} />
        </div>
      </TabsContent>
      
      <TabsContent value="annotations">
        <JourneyAnnotations flow={activeFlow} />
      </TabsContent>
    </>
  );
};

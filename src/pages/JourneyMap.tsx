import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { JourneyFrictionMap } from '@/components/JourneyFrictionMap';
import { useFrictionData } from '@/hooks/useFrictionData';
import { JourneyAnalysisPanel } from '@/components/JourneyAnalysisPanel';
import { JourneyComparisonPanel } from '@/components/JourneyComparisonPanel';
import { JourneyHistoricalTrends } from '@/components/JourneyHistoricalTrends';
import { JourneyAnnotations } from '@/components/JourneyAnnotations';
import { JourneyCreator } from '@/components/JourneyCreator';
import { CohortFilter } from '@/components/CohortFilter';
import { SessionRecordings } from '@/components/SessionRecordings';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { SmartTestPlanner } from '@/components/testing/SmartTestPlanner';
import { SmartActionNudges } from '@/components/SmartActionNudges';
import { Button } from '@/components/ui/button';
import { Download, Share2, Plus, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScopeFilter } from '@/components/journey/FrictionScopeFilter';

const JourneyMap = () => {
  const { flows, activeFlowId, setActiveFlowId, userCohorts } = useFrictionData();
  const activeFlow = flows.find(f => f.id === activeFlowId) || flows[0];
  const [viewMode, setViewMode] = useState<'detail' | 'overview'>('detail');
  const [showCreator, setShowCreator] = useState(false);
  const [showCohortFilter, setShowCohortFilter] = useState(false);
  const [activeCohortId, setActiveCohortId] = useState<string | null>(null);
  const [compareScope, setCompareScope] = useState<boolean>(false);
  const [scopeA, setScopeA] = useState<ScopeFilter>({});
  const [scopeB, setScopeB] = useState<ScopeFilter>({});
  
  return (
    <>
      <DashboardHeader title="Journey Friction Map" description="Visualize user paths and identify friction points">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowCreator(true)}>
            <Plus className="h-4 w-4" />
            <span>New Journey</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => setShowCohortFilter(true)}>
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
      </DashboardHeader>
      
      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="mr-4 flex-shrink-0">
                <label htmlFor="flow-select" className="block text-sm font-medium">Select Journey:</label>
              </div>
              <select 
                id="flow-select"
                className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={activeFlow?.id}
                onChange={(e) => setActiveFlowId(e.target.value)}
              >
                {flows.map(flow => (
                  <option key={flow.id} value={flow.id}>{flow.flow}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'detail' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('detail')}
              >
                Detailed View
              </Button>
              <Button 
                variant={viewMode === 'overview' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('overview')}
              >
                Overview
              </Button>
              <Button 
                variant={compareScope ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setCompareScope(!compareScope)}
              >
                Compare Scopes
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="journey" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="journey">Journey Map</TabsTrigger>
              <TabsTrigger value="sessions">Session Recordings</TabsTrigger>
              <TabsTrigger value="testing">Test Planning</TabsTrigger>
              <TabsTrigger value="analytics">Marketing Analytics</TabsTrigger>
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="journey" className="space-y-6">
              {!compareScope ? (
                <>
                  <JourneyFrictionMap 
                    flow={activeFlow} 
                    cohortId={activeCohortId} 
                  />
                  
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
              ) : (
                <>
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
          </Tabs>
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


import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { JourneyFrictionMap } from '@/components/JourneyFrictionMap';
import { useFrictionData } from '@/hooks/useFrictionData';
import { JourneyAnalysisPanel } from '@/components/JourneyAnalysisPanel';
import { JourneyComparisonPanel } from '@/components/JourneyComparisonPanel';
import { JourneyHistoricalTrends } from '@/components/JourneyHistoricalTrends';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

const JourneyMap = () => {
  const { flows, activeFlowId, setActiveFlowId } = useFrictionData();
  const activeFlow = flows.find(f => f.id === activeFlowId) || flows[0];
  const [viewMode, setViewMode] = useState<'detail' | 'overview'>('detail');
  
  return (
    <>
      <DashboardHeader title="Journey Friction Map" description="Visualize user paths and identify friction points">
        <div className="flex items-center gap-2">
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
            </div>
          </div>
          
          <JourneyFrictionMap flow={activeFlow} />
          
          <JourneyAnalysisPanel flow={activeFlow} />
          
          <JourneyComparisonPanel flows={flows} activeFlowId={activeFlowId} />
          
          <JourneyHistoricalTrends flow={activeFlow} />
        </div>
      </div>
    </>
  );
};

export default JourneyMap;

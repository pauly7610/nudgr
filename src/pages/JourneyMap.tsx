
import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { JourneyFrictionMap } from '@/components/JourneyFrictionMap';
import { useFrictionData } from '@/hooks/useFrictionData';

const JourneyMap = () => {
  const { flows, activeFlowId, setActiveFlowId } = useFrictionData();
  const activeFlow = flows.find(f => f.id === activeFlowId) || flows[0];
  
  return (
    <>
      <DashboardHeader title="Journey Friction Map" description="Visualize user paths and identify friction points" />
      
      <div className="container py-8 space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center mb-4">
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
          
          <JourneyFrictionMap flow={activeFlow} />
        </div>
      </div>
    </>
  );
};

export default JourneyMap;

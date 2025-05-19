
import React from 'react';
import { Flow } from '@/data/mockData';
import { TopFrictionFunnels } from '@/components/TopFrictionFunnels';

interface JourneyOverviewProps {
  flows: Flow[];
  setActiveFlowId: (id: string) => void;
}

export const JourneyOverview: React.FC<JourneyOverviewProps> = ({ 
  flows, 
  setActiveFlowId 
}) => {
  return (
    <div className="bg-card border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Journey Friction Overview</h2>
      <TopFrictionFunnels 
        flows={flows} 
        onFlowClick={setActiveFlowId}
        activeFlowId={null}
      />
      <div className="text-center text-muted-foreground mt-6 mb-2">
        <p>Select a journey above or click on any journey bar to view detailed friction analysis</p>
      </div>
    </div>
  );
};

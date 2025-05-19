
import React from 'react';
import { Button } from '@/components/ui/button';
import { Flow } from '@/data/mockData';

interface JourneySelectorProps {
  flows: Flow[];
  activeFlow: Flow | null;
  setActiveFlowId: (id: string) => void;
  viewMode: 'detail' | 'overview';
  setViewMode: (mode: 'detail' | 'overview') => void;
  compareScope: boolean;
  setCompareScope: (compare: boolean) => void;
}

export const JourneySelector: React.FC<JourneySelectorProps> = ({
  flows,
  activeFlow,
  setActiveFlowId,
  viewMode,
  setViewMode,
  compareScope,
  setCompareScope
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <div className="mr-4 flex-shrink-0">
          <label htmlFor="flow-select" className="block text-sm font-medium">Select Journey:</label>
        </div>
        <select 
          id="flow-select"
          className="bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          value={activeFlow?.id || ""}
          onChange={(e) => setActiveFlowId(e.target.value)}
        >
          <option value="" disabled>Choose a journey</option>
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
  );
};

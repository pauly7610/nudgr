
import React from 'react';
import { Filter, Tag } from 'lucide-react';

interface JourneyHeaderProps {
  flowTitle: string;
  showScopeFilter: boolean;
  showMarketingData: boolean;
  toggleScopeFilter: () => void;
  toggleMarketingData: () => void;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
  flowTitle,
  showScopeFilter,
  showMarketingData,
  toggleScopeFilter,
  toggleMarketingData
}) => {
  return (
    <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{flowTitle} - Journey Friction Map</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Showing full funnel from entry to completion</p>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md ${
            showScopeFilter ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
          }`}
          onClick={toggleScopeFilter}
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Scoping Filters</span>
        </button>
        <button 
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-md ${
            showMarketingData ? 'bg-primary/10 text-primary' : 'hover:bg-muted/80'
          }`}
          onClick={toggleMarketingData}
        >
          <Tag className="h-3.5 w-3.5" />
          <span>Marketing Attribution</span>
        </button>
      </div>
    </div>
  );
};

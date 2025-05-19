
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CurveBehavior } from './types';

interface BehaviorLegendProps {
  selectedFilter: CurveBehavior | 'all';
  onFilterChange: (value: CurveBehavior | 'all') => void;
}

export const BehaviorLegend: React.FC<BehaviorLegendProps> = ({ selectedFilter, onFilterChange }) => {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">View Behavior Classification</h4>
      <ToggleGroup 
        type="single" 
        value={selectedFilter} 
        onValueChange={(value) => {
          if (value) onFilterChange(value as CurveBehavior | 'all');
        }}
        className="justify-start w-full"
      >
        <ToggleGroupItem value="all" className="px-3 gap-2">
          <span>All</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="recentSpike" className="px-3 gap-2">
          <span className="text-lg">📈</span>
          <span className="hidden sm:inline">Recent Spike</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="suddenDrop" className="px-3 gap-2">
          <span className="text-lg">📉</span>
          <span className="hidden sm:inline">Sudden Drop</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="lowValue" className="px-3 gap-2">
          <span className="text-lg">🧊</span>
          <span className="hidden sm:inline">Low Value</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="slowDecay" className="px-3 gap-2">
          <span className="text-lg">🔄</span>
          <span className="hidden sm:inline">Slow Decay</span>
        </ToggleGroupItem>
      </ToggleGroup>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        <div className="flex items-center p-2 border rounded-md bg-slate-50">
          <div className="text-2xl mr-2">📈</div>
          <div>
            <h5 className="text-sm font-medium">Recent Spike</h5>
            <p className="text-xs text-muted-foreground">Increase in views in last 7-14 days</p>
          </div>
        </div>
        <div className="flex items-center p-2 border rounded-md bg-slate-50">
          <div className="text-2xl mr-2">📉</div>
          <div>
            <h5 className="text-sm font-medium">Sudden Drop</h5>
            <p className="text-xs text-muted-foreground">Sharp decline after sustained usage</p>
          </div>
        </div>
        <div className="flex items-center p-2 border rounded-md bg-slate-50">
          <div className="text-2xl mr-2">🧊</div>
          <div>
            <h5 className="text-sm font-medium">Low Value</h5>
            <p className="text-xs text-muted-foreground">Very low engagement over entire period</p>
          </div>
        </div>
        <div className="flex items-center p-2 border rounded-md bg-slate-50">
          <div className="text-2xl mr-2">🔄</div>
          <div>
            <h5 className="text-sm font-medium">Slow Decay</h5>
            <p className="text-xs text-muted-foreground">Gradual decline, may still have value</p>
          </div>
        </div>
      </div>
    </div>
  );
};

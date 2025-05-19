
import React from 'react';

export const BehaviorLegend: React.FC = () => {
  return (
    <div className="mb-4">
      <h4 className="font-medium mb-2">View Behavior Classification</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

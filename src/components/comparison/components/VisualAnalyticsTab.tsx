
import React from 'react';

export const VisualAnalyticsTab: React.FC = () => {
  return (
    <div className="p-6">
      <h3 className="font-medium mb-3">Visual Comparison</h3>
      <p className="text-muted-foreground mb-4">
        Visualize differences in metrics across selected audience cohorts
      </p>
      
      <div className="h-64 flex items-center justify-center border rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">Charts comparing friction metrics will appear here</div>
          <p className="text-sm">Bar and line charts showing key metrics side-by-side</p>
        </div>
      </div>
    </div>
  );
};

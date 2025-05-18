
import React from 'react';

export const DropOffAnalysisTab: React.FC = () => {
  return (
    <div className="p-6">
      <h3 className="font-medium mb-3">Drop-off Difference Analysis</h3>
      <p className="text-muted-foreground mb-4">
        Compare where users are dropping off between different cohorts
      </p>
      
      <div className="h-64 flex items-center justify-center border rounded-lg">
        <div className="text-center text-muted-foreground">
          <div className="mb-2">Flow step comparison visualization will appear here</div>
          <p className="text-sm">Shows where drop-offs differ between cohorts</p>
        </div>
      </div>
    </div>
  );
};

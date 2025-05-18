
import React from 'react';

export const CohortComparison: React.FC = () => {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">Cohort Comparison</h2>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6 text-center text-muted-foreground">
          <p>Select two or more cohorts above to compare their metrics</p>
        </div>
      </div>
    </div>
  );
};

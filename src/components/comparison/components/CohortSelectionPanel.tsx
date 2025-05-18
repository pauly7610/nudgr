
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCohort } from '@/data/mockData';

interface CohortSelectionPanelProps {
  userCohorts: UserCohort[];
  selectedCohortIds: string[];
  onCohortSelect: (cohortId: string) => void;
}

export const CohortSelectionPanel: React.FC<CohortSelectionPanelProps> = ({
  userCohorts,
  selectedCohortIds,
  onCohortSelect,
}) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Select Cohorts to Compare</h3>
          <p className="text-muted-foreground">Choose at least two cohorts to analyze differences in metrics and friction points</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {userCohorts.map(cohort => (
            <div 
              key={cohort.id}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                selectedCohortIds.includes(cohort.id) 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onCohortSelect(cohort.id)}
            >
              <div className="flex items-start gap-2">
                <Checkbox 
                  checked={selectedCohortIds.includes(cohort.id)}
                  onCheckedChange={() => onCohortSelect(cohort.id)}
                />
                <div className="flex-1">
                  <div className="font-medium">{cohort.name}</div>
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <div className="text-muted-foreground">
                      Conv: {cohort.conversionRate}%
                    </div>
                    <div className="text-muted-foreground">
                      Friction: {cohort.frictionScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

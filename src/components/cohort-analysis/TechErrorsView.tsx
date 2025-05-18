
import React from 'react';
import { Button } from '@/components/ui/button';
import { TechnicalErrorCorrelation } from '@/components/TechnicalErrorCorrelation';
import { UserCohort } from '@/data/mockData';

interface TechErrorsViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const TechErrorsView: React.FC<TechErrorsViewProps> = ({
  cohort,
  onBack
}) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Technical Errors: {cohort.name}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
          >
            Back to Cohort
          </Button>
        </div>
      </div>
      
      <TechnicalErrorCorrelation />
    </div>
  );
};

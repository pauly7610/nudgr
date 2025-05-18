
import React from 'react';
import { Button } from '@/components/ui/button';
import { ElementFrictionAnalytics } from '@/components/ElementFrictionAnalytics';
import { UserCohort } from '@/data/mockData';

interface ElementAnalysisViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const ElementAnalysisView: React.FC<ElementAnalysisViewProps> = ({
  cohort,
  onBack
}) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Element Friction: {cohort.name}</h2>
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
      
      <ElementFrictionAnalytics cohort={cohort} />
    </div>
  );
};

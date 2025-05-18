
import React from 'react';
import { Button } from '@/components/ui/button';
import { AccessibilityFrictionIdentifier } from '@/components/AccessibilityFrictionIdentifier';
import { UserCohort } from '@/data/mockData';

interface AccessibilityViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const AccessibilityView: React.FC<AccessibilityViewProps> = ({
  cohort,
  onBack
}) => {
  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Accessibility Analysis: {cohort.name}</h2>
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
      
      <AccessibilityFrictionIdentifier />
    </div>
  );
};

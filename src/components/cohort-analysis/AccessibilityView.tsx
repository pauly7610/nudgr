
import React from 'react';
import { Button } from '@/components/ui/button';
import { AccessibilityFrictionIdentifier } from '@/components/AccessibilityFrictionIdentifier';
import { UserCohort } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';

interface AccessibilityViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const AccessibilityView: React.FC<AccessibilityViewProps> = ({
  cohort,
  onBack
}) => {
  return (
    <div className="mt-6">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto flex items-center hover:text-primary hover:bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to cohort overview
        </Button>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">{cohort.name}</span>
        <span className="mx-2">/</span>
        <span className="text-muted-foreground">Accessibility Analysis</span>
      </div>
    
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Accessibility Analysis: {cohort.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Identify and fix accessibility issues affecting this user cohort
          </p>
        </div>
      </div>
      
      <AccessibilityFrictionIdentifier />
    </div>
  );
};

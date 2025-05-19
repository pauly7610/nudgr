
import React from 'react';
import { Button } from '@/components/ui/button';
import { ElementFrictionAnalytics } from '@/components/ElementFrictionAnalytics';
import { UserCohort } from '@/data/mockData';
import { ArrowLeft } from 'lucide-react';

interface ElementAnalysisViewProps {
  cohort: UserCohort;
  onBack: () => void;
}

export const ElementAnalysisView: React.FC<ElementAnalysisViewProps> = ({
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
        <span className="text-muted-foreground">Element Analysis</span>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Element Friction: {cohort.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Analyze how users interact with specific UI elements in this cohort
          </p>
        </div>
      </div>
      
      <ElementFrictionAnalytics cohort={cohort} />
    </div>
  );
};

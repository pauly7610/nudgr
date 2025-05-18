
import React from 'react';
import { Flow } from '../../data/mockData';
import { ArrowRight } from 'lucide-react';
import { JourneyStep } from './JourneyStep';

interface JourneyVisualizationProps {
  steps: any[];
  hasFiltersApplied: boolean;
  expandedStepIndex: number | null;
  setExpandedStepIndex: (index: number | null) => void;
  detailedJourney: any[];
}

export const JourneyVisualization: React.FC<JourneyVisualizationProps> = ({
  steps,
  hasFiltersApplied,
  expandedStepIndex,
  setExpandedStepIndex,
  detailedJourney
}) => {
  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex min-w-max">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;
          const previousUsers = index > 0 ? steps[index - 1].users : step.users;
          const detailedStep = detailedJourney[index] || null;
          const isExpanded = expandedStepIndex === index;
          
          return (
            <React.Fragment key={`step-${index}`}>
              <JourneyStep 
                step={step}
                index={index}
                isLastStep={isLastStep}
                previousUsers={previousUsers}
                detailedStep={detailedStep}
                isExpanded={isExpanded}
                toggleExpanded={() => setExpandedStepIndex(isExpanded ? null : index)}
              />
              
              {!isLastStep && (
                <div className="flex items-center mx-4">
                  <ArrowRight className="text-muted-foreground" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

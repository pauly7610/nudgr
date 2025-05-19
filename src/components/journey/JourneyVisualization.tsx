
import React, { useState } from 'react';
import { Flow } from '../../data/mockData';
import { ArrowRight } from 'lucide-react';
import { JourneyStep } from './JourneyStep';
import { Select } from '../ui/select';
import { Label } from '../ui/label';

// Define flow dimension options
type FlowDimension = 'pages' | 'events' | 'devices' | 'marketing';

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
  const [flowDimension, setFlowDimension] = useState<FlowDimension>('pages');
  
  // Dynamically adjust visualization based on selected dimension
  const getDimensionLabel = (step: any, dimension: FlowDimension) => {
    switch(dimension) {
      case 'events':
        return step.event || step.label;
      case 'devices':
        return step.device || 'Multi-device';
      case 'marketing':
        return step.campaign || 'Organic';
      default:
        return step.label;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 px-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="dimension-select" className="text-sm font-medium">
            View Dimension:
          </Label>
          <select
            id="dimension-select"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={flowDimension}
            onChange={(e) => setFlowDimension(e.target.value as FlowDimension)}
          >
            <option value="pages">Pages</option>
            <option value="events">User Events</option>
            <option value="devices">Devices</option>
            <option value="marketing">Marketing Channels</option>
          </select>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="flex min-w-max">
          {steps.map((step, index) => {
            const isLastStep = index === steps.length - 1;
            const previousUsers = index > 0 ? steps[index - 1].users : step.users;
            const detailedStep = detailedJourney[index] || null;
            const isExpanded = expandedStepIndex === index;
            
            // Use dynamic dimension labeling
            const dimensionLabel = getDimensionLabel(step, flowDimension);
            
            return (
              <React.Fragment key={`step-${index}`}>
                <JourneyStep 
                  step={{...step, dimensionLabel}}
                  index={index}
                  isLastStep={isLastStep}
                  previousUsers={previousUsers}
                  detailedStep={detailedStep}
                  isExpanded={isExpanded}
                  toggleExpanded={() => setExpandedStepIndex(isExpanded ? null : index)}
                  flowDimension={flowDimension}
                />
                
                {!isLastStep && (
                  <div className="flex items-center mx-6">
                    <ArrowRight className="text-muted-foreground" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

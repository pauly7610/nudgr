
import React, { useState } from 'react';
import { Flow } from '../../data/mockData';
import { ArrowRight, HelpCircle, Info } from 'lucide-react';
import { JourneyStep } from './JourneyStep';
import { Select } from '../ui/select';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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

  // Helper text for each dimension
  const getDimensionHelperText = () => {
    switch(flowDimension) {
      case 'events':
        return "Shows user events like clicks, form submissions, and interactions at each step";
      case 'devices':
        return "Shows which devices users are using at each journey step";
      case 'marketing':
        return "Shows marketing channel attribution for users at each step";
      default:
        return "Shows pages users visit during this journey";
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 px-6 pt-4">
        <div className="text-sm text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center gap-1 cursor-help">
                  <Info className="h-3.5 w-3.5" />
                  <span>Click on steps to see details. Use arrows to follow the journey flow.</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Each box represents a step in the user journey. Steps with yellow highlights indicate friction points.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="dimension-select" className="text-sm font-medium inline-flex items-center gap-1 cursor-help">
                  View Dimension:
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getDimensionHelperText()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        {steps.length === 0 ? (
          <div className="text-center p-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">No journey steps to display with current filters.</p>
          </div>
        ) : (
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
        )}
      </div>
      
      {steps.length > 0 && (
        <div className="px-6 pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            <span>Tip: Change the dimension view above to analyze your journey from different perspectives.</span>
          </div>
        </div>
      )}
    </div>
  );
};

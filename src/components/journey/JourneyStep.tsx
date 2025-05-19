
import React from 'react';
import { Button } from '../ui/button';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailedStep, FrictionType } from '../../data/mockData';
import { DetailedActions } from './DetailedActions';

type FlowDimension = 'pages' | 'events' | 'devices' | 'marketing';

interface JourneyStepProps {
  step: {
    label: string;
    dimensionLabel?: string;
    users: number;
    dropOff?: number;
    friction?: FrictionType[];
  };
  index: number;
  isLastStep: boolean;
  previousUsers: number;
  detailedStep: DetailedStep | null;
  isExpanded: boolean;
  toggleExpanded: () => void;
  flowDimension?: FlowDimension;
}

export const JourneyStep: React.FC<JourneyStepProps> = ({
  step,
  index,
  isLastStep,
  previousUsers,
  detailedStep,
  isExpanded,
  toggleExpanded,
  flowDimension = 'pages',
}) => {
  const dropOffRate = step.dropOff ? Math.round((step.dropOff / previousUsers) * 100) : 0;
  const hasFriction = step.friction && step.friction.length > 0;
  
  // Helper to format friction types for display
  const formatFrictionType = (type: FrictionType): string => {
    switch(type) {
      case 'rage_clicks':
        return 'Rage Clicks';
      case 'form_abandonment':
        return 'Form Abandonment';
      case 'navigation_loops':
        return 'Navigation Loops';
      case 'excessive_scrolling':
        return 'Excessive Scrolling';
      default:
        return type;
    }
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get dimension-specific badge color
  const getDimensionBadgeClass = () => {
    switch(flowDimension) {
      case 'events':
        return 'bg-blue-100 text-blue-800';
      case 'devices':
        return 'bg-purple-100 text-purple-800';
      case 'marketing':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col items-center relative">
      <div 
        className={`w-64 p-4 border rounded-lg ${
          hasFriction ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
        }`}
      >
        <div className="text-center mb-2">
          <div className="font-medium">{step.dimensionLabel || step.label}</div>
          <div className="text-sm text-muted-foreground">Step {index + 1}</div>
          {flowDimension !== 'pages' && (
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getDimensionBadgeClass()}`}>
              {flowDimension}
            </div>
          )}
          {detailedStep && (
            <div className="text-xs text-blue-600 mt-1">
              {detailedStep.page} 
              <span className="text-muted-foreground ml-1">({formatTime(detailedStep.timeSpent)})</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-muted/40 p-2 rounded text-center">
            <div className="font-medium">{step.users.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Visitors</div>
          </div>
          
          <div className={`p-2 rounded text-center ${
            dropOffRate > 30 ? 'bg-red-100 text-red-700' :
            dropOffRate > 15 ? 'bg-amber-100 text-amber-700' :
            'bg-muted/40'
          }`}>
            <div className="font-medium">{dropOffRate}%</div>
            <div className="text-xs text-muted-foreground">Drop-off</div>
          </div>
        </div>
        
        {hasFriction && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle size={14} className="text-amber-500" />
              <span className="text-xs font-medium">Friction Detected</span>
            </div>
            <div className="space-y-1">
              {step.friction?.map((issue, i) => (
                <div key={i} className="text-xs px-2 py-1 bg-amber-100 rounded-sm">
                  {formatFrictionType(issue)}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {detailedStep && (
          <div className="mt-3 pt-2 border-t">
            <Button 
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-center"
              onClick={toggleExpanded}
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
              {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            
            {isExpanded && <DetailedActions detailedStep={detailedStep} />}
          </div>
        )}
      </div>
      
      {step.dropOff && (
        <div className="mt-2 text-center">
          <div className="text-xs font-medium text-red-500">
            {dropOffRate}% drop-off
          </div>
        </div>
      )}

      {/* Removed the absolute positioned drop-off information that showed "-X users" */}
    </div>
  );
};

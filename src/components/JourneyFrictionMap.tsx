
import React from 'react';
import { Flow, FrictionType } from '../data/mockData';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface JourneyFrictionMapProps {
  flow: Flow | null;
  cohortId?: string | null;
}

export const JourneyFrictionMap: React.FC<JourneyFrictionMapProps> = ({ flow, cohortId }) => {
  if (!flow) {
    return (
      <div className="rounded-lg border bg-card h-96 flex items-center justify-center">
        <div className="text-center p-6">
          <h3 className="text-lg font-medium mb-2">Select a Journey to View</h3>
          <p className="text-muted-foreground">Click on any flow in the dashboard to view its journey friction map</p>
        </div>
      </div>
    );
  }

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
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{flow.flow} - Journey Friction Map</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Showing full funnel from entry to completion</p>
        </div>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="flex min-w-max">
          {flow.steps.map((step, index) => {
            const isLastStep = index === flow.steps.length - 1;
            const previousUsers = index > 0 ? flow.steps[index - 1].users : step.users;
            const dropOffRate = step.dropOff ? Math.round((step.dropOff / previousUsers) * 100) : 0;
            const hasFriction = step.friction && step.friction.length > 0;
            
            return (
              <React.Fragment key={`step-${index}`}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-48 p-4 border rounded-lg ${
                      hasFriction ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className="font-medium">{step.label}</div>
                      <div className="text-sm text-muted-foreground">Step {index + 1}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/40 p-2 rounded text-center">
                        <div className="font-medium">{step.users.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Users</div>
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
                  </div>
                  
                  {step.dropOff && (
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-red-500">-{step.dropOff.toLocaleString()} users</div>
                    </div>
                  )}
                </div>
                
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
    </div>
  );
};

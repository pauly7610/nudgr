
import React, { useState } from 'react';
import { FrictionType, Flow } from '../data/mockData';
import { AlertCircle, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface JourneyAnalysisPanelProps {
  flow: Flow | null;
}

export const JourneyAnalysisPanel: React.FC<JourneyAnalysisPanelProps> = ({ flow }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!flow) return null;
  
  // Find highest friction step
  const highestFrictionStep = flow.steps.reduce((prev, current) => {
    const prevFrictions = prev.friction?.length || 0;
    const currentFrictions = current.friction?.length || 0;
    return currentFrictions > prevFrictions ? current : prev;
  }, flow.steps[0]);
  
  // Calculate overall drop-off
  const startUsers = flow.steps[0].users;
  const endUsers = flow.steps[flow.steps.length - 1].users;
  const overallDropOff = startUsers > 0 ? ((startUsers - endUsers) / startUsers) * 100 : 0;
  
  // Get all friction types in the flow
  const allFrictionTypes = flow.steps.reduce((types, step) => {
    if (step.friction) {
      step.friction.forEach(type => {
        if (!types.includes(type)) {
          types.push(type);
        }
      });
    }
    return types;
  }, [] as FrictionType[]);
  
  const formatFrictionType = (type: FrictionType): string => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  // Generate optimization recommendations based on friction points
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (allFrictionTypes.includes('rage_clicks')) {
      recommendations.push({
        title: "Address Rage Clicks", 
        description: "Review UI elements that receive multiple rapid clicks to improve clarity and responsiveness."
      });
    }
    
    if (allFrictionTypes.includes('form_abandonment')) {
      recommendations.push({
        title: "Simplify Forms", 
        description: "Reduce form fields or break into multiple steps to improve completion rates."
      });
    }
    
    if (allFrictionTypes.includes('navigation_loops')) {
      recommendations.push({
        title: "Improve Navigation", 
        description: "Review navigation patterns where visitors repeatedly visit the same pages."
      });
    }
    
    if (allFrictionTypes.includes('excessive_scrolling')) {
      recommendations.push({
        title: "Optimize Page Layout", 
        description: "Reorganize content to place important information above the fold."
      });
    }
    
    if (overallDropOff > 50) {
      recommendations.push({
        title: "Address High Drop-off", 
        description: "Review the entire funnel for major bottlenecks causing significant visitor loss."
      });
    }
    
    return recommendations;
  };
  
  const recommendations = generateRecommendations();
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden mt-6">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Detailed Friction Analysis
        </h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Journey Overview</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span>Overall Conversion Rate</span>
                  <span className="font-medium">{((endUsers / startUsers) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span>Total Drop-off</span>
                  <span className="font-medium text-red-600">{overallDropOff.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span>Highest Friction Step</span>
                  <span className="font-medium">{highestFrictionStep.label}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-md">
                  <span>Total Friction Types</span>
                  <span className="font-medium">{allFrictionTypes.length}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Detected Friction Types</h4>
              <div className="space-y-2">
                {allFrictionTypes.map((type, index) => (
                  <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{formatFrictionType(type)}</span>
                      {type === 'form_abandonment' ? (
                        <span className="text-red-600 flex items-center"><TrendingUp className="h-4 w-4 mr-1" /> High Impact</span>
                      ) : (
                        <span className="text-amber-600 flex items-center"><TrendingDown className="h-4 w-4 mr-1" /> Medium Impact</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-2">Optimization Recommendations</h4>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border bg-green-50 border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-800">{rec.title}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Flow } from '../data/mockData';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface JourneyComparisonPanelProps {
  flows: Flow[];
  activeFlowId: string | null;
}

export const JourneyComparisonPanel: React.FC<JourneyComparisonPanelProps> = ({ flows, activeFlowId }) => {
  const [expanded, setExpanded] = useState(false);
  const [comparisonFlowId, setComparisonFlowId] = useState<string | null>(null);
  
  const activeFlow = flows.find(f => f.id === activeFlowId) || flows[0];
  const comparisonFlow = flows.find(f => f.id === comparisonFlowId);
  
  // Available flows for comparison (excluding the active one)
  const availableFlows = flows.filter(f => f.id !== activeFlow?.id);
  
  // Calculate conversion rate
  const getConversionRate = (flow: Flow): number => {
    const startUsers = flow.steps[0].users;
    const endUsers = flow.steps[flow.steps.length - 1].users;
    return (endUsers / startUsers) * 100;
  };
  
  // Calculate average drop-off per step
  const getAverageDropOff = (flow: Flow): number => {
    let totalDropOff = 0;
    let stepsWithDropOff = 0;
    
    flow.steps.forEach(step => {
      if (step.dropOff) {
        totalDropOff += step.dropOff;
        stepsWithDropOff++;
      }
    });
    
    return stepsWithDropOff > 0 ? totalDropOff / stepsWithDropOff : 0;
  };
  
  // Count total friction points
  const getTotalFrictionPoints = (flow: Flow): number => {
    return flow.steps.reduce((total, step) => total + (step.friction?.length || 0), 0);
  };
  
  // Handle flow selection for comparison
  const handleFlowSelect = (value: string) => {
    setComparisonFlowId(value);
  };
  
  return (
    <div className="rounded-lg border bg-card overflow-hidden mt-6">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <h3 className="font-semibold">Journey Comparison</h3>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      
      {expanded && (
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="comparison-flow" className="block text-sm font-medium mb-2">Select Flow to Compare With</label>
            <Select onValueChange={handleFlowSelect} value={comparisonFlowId || undefined}>
              <SelectTrigger id="comparison-flow" className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a flow to compare..." />
              </SelectTrigger>
              <SelectContent>
                {availableFlows.map(flow => (
                  <SelectItem key={flow.id} value={flow.id}>
                    {flow.flow}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {comparisonFlow ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComparisonMetric 
                  title="Conversion Rate" 
                  value1={getConversionRate(activeFlow).toFixed(1) + "%"}
                  value2={getConversionRate(comparisonFlow).toFixed(1) + "%"}
                  label1={activeFlow.flow}
                  label2={comparisonFlow.flow}
                  better={getConversionRate(activeFlow) > getConversionRate(comparisonFlow) ? 1 : 2}
                />
                
                <ComparisonMetric 
                  title="Avg. Drop-Off Per Step" 
                  value1={getAverageDropOff(activeFlow).toFixed(0)}
                  value2={getAverageDropOff(comparisonFlow).toFixed(0)}
                  label1={activeFlow.flow}
                  label2={comparisonFlow.flow}
                  better={getAverageDropOff(activeFlow) < getAverageDropOff(comparisonFlow) ? 1 : 2}
                />
                
                <ComparisonMetric 
                  title="Total Friction Points" 
                  value1={getTotalFrictionPoints(activeFlow).toString()}
                  value2={getTotalFrictionPoints(comparisonFlow).toString()}
                  label1={activeFlow.flow}
                  label2={comparisonFlow.flow}
                  better={getTotalFrictionPoints(activeFlow) < getTotalFrictionPoints(comparisonFlow) ? 1 : 2}
                />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 bg-muted text-left">Step</th>
                      <th className="py-2 px-4 bg-muted text-left">{activeFlow.flow} Users</th>
                      <th className="py-2 px-4 bg-muted text-left">{comparisonFlow.flow} Users</th>
                      <th className="py-2 px-4 bg-muted text-left">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeFlow.steps.map((step, index) => {
                      const comparisonStep = comparisonFlow.steps[index];
                      if (!comparisonStep) return null;
                      
                      const difference = step.users - comparisonStep.users;
                      const percentDifference = ((difference / comparisonStep.users) * 100).toFixed(1);
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="py-2 px-4">{step.label}</td>
                          <td className="py-2 px-4">{step.users.toLocaleString()}</td>
                          <td className="py-2 px-4">{comparisonStep.users.toLocaleString()}</td>
                          <td className={`py-2 px-4 ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {difference > 0 ? '+' : ''}{difference.toLocaleString()} ({percentDifference}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <p>Select a journey to compare with {activeFlow.flow}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for comparison metrics
const ComparisonMetric: React.FC<{
  title: string;
  value1: string;
  value2: string;
  label1: string;
  label2: string;
  better: 1 | 2; // 1 if first value is better, 2 if second value is better
}> = ({ title, value1, value2, label1, label2, better }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 px-3 py-2 border-b">
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs">{label1}</span>
          <span className={`font-bold ${better === 1 ? 'text-green-600' : ''}`}>{value1}</span>
        </div>
        <div className="flex justify-center">
          <ArrowRight className="text-muted-foreground" size={16} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">{label2}</span>
          <span className={`font-bold ${better === 2 ? 'text-green-600' : ''}`}>{value2}</span>
        </div>
      </div>
    </div>
  );
};

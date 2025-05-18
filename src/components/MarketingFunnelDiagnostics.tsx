
import React from 'react';
import { Flow } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Clock, RefreshCw, ExternalLink } from 'lucide-react';

interface MarketingFunnelDiagnosticsProps {
  flow: Flow | null;
}

export const MarketingFunnelDiagnostics: React.FC<MarketingFunnelDiagnosticsProps> = ({ flow }) => {
  if (!flow) {
    return null;
  }
  
  // Calculate dropout points - focus on steps with highest drop-offs
  const dropoutPoints = flow.steps
    .filter(step => step.dropOff && step.dropOff > 0)
    .map((step, index) => {
      const previousStep = index > 0 ? flow.steps[index - 1].users : flow.steps[0].users;
      const dropOffRate = step.dropOff ? Math.round((step.dropOff / previousStep) * 100) : 0;
      
      return {
        stepLabel: step.label,
        dropOff: step.dropOff || 0,
        dropOffRate,
        // Mock diagnostic data - in real app this would come from actual data
        diagnostics: {
          timeOnPageBeforeExit: Math.round(Math.random() * 60) + 5, // 5-65 seconds
          failedAttempts: Math.floor(Math.random() * 3), // 0-2 attempts
          tabSwitchingFrequency: Math.round(Math.random() * 5), // 0-5 switches
          hasMarketingMismatch: Math.random() > 0.6, // 40% chance
        }
      };
    })
    .sort((a, b) => b.dropOffRate - a.dropOffRate); // Sort by highest drop-off rate
  
  const DiagnosticItem = ({ 
    label, 
    value, 
    unit, 
    icon, 
    warning = false 
  }: { 
    label: string; 
    value: number | string; 
    unit?: string; 
    icon: React.ReactNode;
    warning?: boolean;
  }) => (
    <div className={`flex items-start gap-2 p-3 rounded-md ${warning ? 'bg-amber-50' : 'bg-muted/30'}`}>
      <div className={`mt-0.5 ${warning ? 'text-amber-500' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm flex items-baseline gap-1">
          <span className={`text-lg ${warning ? 'text-amber-600' : ''}`}>{value}</span>
          {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
        </div>
      </div>
    </div>
  );
  
  if (dropoutPoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Marketing Funnel Diagnostics</CardTitle>
          <CardDescription>Why users are leaving your funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No significant drop-off points detected in this journey.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // We'll focus on the top drop-off point for detailed diagnostics
  const topDropOff = dropoutPoints[0];
  const {timeOnPageBeforeExit, failedAttempts, tabSwitchingFrequency, hasMarketingMismatch} = topDropOff.diagnostics;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Funnel Diagnostics</CardTitle>
        <CardDescription>Why users are leaving your funnel</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-1">
            Top Drop-off Point: {topDropOff.stepLabel}
          </h3>
          <div className="text-sm text-muted-foreground mb-4">
            <span className="text-red-500 font-semibold">{topDropOff.dropOffRate}%</span> of users drop off at this step ({topDropOff.dropOff.toLocaleString()} users)
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <DiagnosticItem 
              label="Time on page before exit" 
              value={timeOnPageBeforeExit} 
              unit="seconds"
              icon={<Clock className="h-4 w-4" />} 
              warning={timeOnPageBeforeExit < 10}
            />
            
            <DiagnosticItem 
              label="Failed attempt count" 
              value={failedAttempts} 
              icon={<RefreshCw className="h-4 w-4" />}
              warning={failedAttempts > 0}
            />
            
            <DiagnosticItem 
              label="Tab switching frequency" 
              value={tabSwitchingFrequency} 
              icon={<ExternalLink className="h-4 w-4" />}
              warning={tabSwitchingFrequency > 2}
            />
            
            <DiagnosticItem 
              label="Marketing message match" 
              value={hasMarketingMismatch ? "Mismatch detected" : "Aligned"} 
              icon={<AlertCircle className="h-4 w-4" />}
              warning={hasMarketingMismatch}
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800">
            <h4 className="font-medium mb-2">Diagnostic Insight</h4>
            {timeOnPageBeforeExit < 10 && (
              <p className="text-sm mb-2">
                <strong>Quick exits:</strong> Users are leaving quickly ({timeOnPageBeforeExit} seconds), suggesting immediate confusion or mismatch between expectations and page content.
              </p>
            )}
            {failedAttempts > 0 && (
              <p className="text-sm mb-2">
                <strong>Repeated attempts:</strong> Users are trying {failedAttempts} times before abandoning, indicating form validation issues or unclear instructions.
              </p>
            )}
            {tabSwitchingFrequency > 2 && (
              <p className="text-sm mb-2">
                <strong>Multiple tab switches:</strong> Users are switching tabs {tabSwitchingFrequency} times, suggesting they're looking for missing information or comparing offers.
              </p>
            )}
            {hasMarketingMismatch && (
              <p className="text-sm">
                <strong>Marketing mismatch:</strong> There appears to be a disconnect between marketing messaging and the actual page content or offer.
              </p>
            )}
          </div>
        </div>
        
        {dropoutPoints.length > 1 && (
          <div>
            <h3 className="text-md font-medium mb-2">Other significant drop-off points</h3>
            <div className="space-y-2">
              {dropoutPoints.slice(1, 3).map((point, i) => (
                <div key={i} className="p-3 border rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium">{point.stepLabel}</span>
                    <span className="text-red-500">{point.dropOffRate}% drop-off</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {point.diagnostics.timeOnPageBeforeExit} seconds average time before exit
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

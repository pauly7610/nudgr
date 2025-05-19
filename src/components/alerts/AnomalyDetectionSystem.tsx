
import React from 'react';
import { Alert } from '../../data/mockData';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

interface AnomalyDetectionSystemProps {
  alerts: Alert[];
}

interface AnomalyStats {
  confidenceLevel: number;
  severity: 'low' | 'medium' | 'high';
  relatedAnomalies: number;
  baselineDeviation: number;
}

export const AnomalyDetectionSystem: React.FC<AnomalyDetectionSystemProps> = ({ alerts }) => {
  // Mock function to calculate statistical anomaly stats
  const getAnomalyStats = (alert: Alert): AnomalyStats => {
    // In a real implementation, this would use statistical models
    const confidenceLevel = Math.floor(Math.random() * 30) + 70; // 70-99%
    const baselineDeviation = Math.floor(Math.random() * 50) + 50; // 50-99%
    const relatedAnomalies = Math.floor(Math.random() * 3) + 1; // 1-3 related anomalies
    
    let severity: 'low' | 'medium' | 'high' = 'medium';
    if (confidenceLevel > 90) severity = 'high';
    else if (confidenceLevel < 80) severity = 'low';
    
    return {
      confidenceLevel,
      severity,
      relatedAnomalies,
      baselineDeviation
    };
  };
  
  // Get severity color class
  const getSeverityColorClass = (severity: 'low' | 'medium' | 'high') => {
    switch(severity) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Group related anomalies (in a real app this would be more sophisticated)
  const anomalyGroups = alerts.reduce((groups, alert) => {
    const stats = getAnomalyStats(alert);
    const existingGroup = groups.find(g => g.flowId === alert.flowId && g.alerts.length < stats.relatedAnomalies);
    
    if (existingGroup) {
      existingGroup.alerts.push(alert);
    } else {
      groups.push({ 
        flowId: alert.flowId, 
        alerts: [alert],
        stats
      });
    }
    
    return groups;
  }, [] as Array<{flowId: string; alerts: Alert[]; stats: AnomalyStats}>);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Statistical Anomaly Detection</h3>
      
      <div className="space-y-3">
        {anomalyGroups.map((group, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Anomaly Cluster #{index + 1}</h4>
              <Badge 
                variant="outline" 
                className={getSeverityColorClass(group.stats.severity)}
              >
                {group.stats.severity} severity
              </Badge>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Confidence Level:</span>
                <div className="flex items-center mt-1">
                  <Progress value={group.stats.confidenceLevel} className="h-2" />
                  <span className="ml-2 text-sm font-medium">{group.stats.confidenceLevel}%</span>
                </div>
              </div>
              
              <div className="text-sm">
                <span className="text-muted-foreground">Baseline Deviation:</span>
                <span className="ml-2 font-medium">{group.stats.baselineDeviation}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {group.alerts.map((alert, i) => (
                <div key={i} className="text-sm bg-muted/30 p-2 rounded">
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {anomalyGroups.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            No statistical anomalies detected in the current dataset.
          </div>
        )}
      </div>
    </div>
  );
};

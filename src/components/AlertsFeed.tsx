
import React from 'react';
import { Alert } from '../data/mockData';
import { formatDistanceToNow } from 'date-fns';

interface AlertsFeedProps {
  alerts: Alert[];
  onAlertClick: (alert: Alert) => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({ alerts, onAlertClick }) => {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold">Real-time Alerts</h3>
        <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5">Live</span>
      </div>
      
      <div className="divide-y overflow-auto" style={{ maxHeight: '400px' }}>
        {alerts.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No alerts detected. The system is monitoring for friction.
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => onAlertClick(alert)}
            >
              <div className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.type === 'warning' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                    <span className="text-xs text-primary font-medium">View details</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

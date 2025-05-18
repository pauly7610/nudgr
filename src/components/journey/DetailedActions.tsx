
import React from 'react';
import { MousePointerClick, Eye, ChevronDown, ChevronUp, MousePointer } from 'lucide-react';
import { DetailedAction, DetailedStep } from '../../data/mockData';

interface DetailedActionsProps {
  detailedStep: DetailedStep;
}

export const DetailedActions: React.FC<DetailedActionsProps> = ({ detailedStep }) => {
  // Render action icon based on type
  const renderActionIcon = (type: DetailedAction['type']) => {
    switch (type) {
      case 'click':
        return <MousePointerClick className="h-3 w-3" />;
      case 'view':
        return <Eye className="h-3 w-3" />;
      case 'scroll':
        return <ChevronDown className="h-3 w-3" />;
      case 'form_input':
        return <ChevronUp className="h-3 w-3" />;
      case 'hover':
        return <MousePointer className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-2 space-y-2 text-xs bg-slate-50 p-2 rounded-md">
      <div className="font-medium text-blue-700 border-b pb-1 mb-1">
        User Actions on {detailedStep.page}
      </div>
      
      {detailedStep.actions.map((action, i) => (
        <div key={i} className="flex items-start gap-2 pb-2 border-b last:border-0 last:pb-0">
          <div className="mt-1">
            {renderActionIcon(action.type)}
          </div>
          <div className="w-full">
            <div className="font-medium">{action.description}</div>
            <div className="text-muted-foreground flex justify-between text-2xs">
              <span>{action.element}</span>
              <span>{action.timestamp}{action.duration ? ` (${action.duration}s)` : ''}</span>
            </div>
            {action.type === 'hover' && action.hoverData && (
              <div className="mt-1 bg-blue-50 border border-blue-100 rounded p-1 text-2xs">
                <div className="flex justify-between mb-1">
                  <span className="text-blue-700">Hover Analytics:</span>
                  <span className="font-medium">{action.hoverData.dwellTime}s dwell time</span>
                </div>
                <div className="text-muted-foreground truncate">
                  Element: {action.hoverData.coordinates}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      <div className="text-right text-2xs text-muted-foreground italic">
        URL: {detailedStep.url}
      </div>
    </div>
  );
};

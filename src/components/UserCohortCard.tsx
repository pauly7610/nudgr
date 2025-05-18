
import React from 'react';
import { UserCohort } from '../data/mockData';
import { Progress } from '@/components/ui/progress';

interface UserCohortCardProps {
  cohort: UserCohort;
}

export const UserCohortCard: React.FC<UserCohortCardProps> = ({ cohort }) => {
  // Determine progress color based on friction score
  const getFrictionClass = (score: number) => {
    if (score < 30) return 'progress-low';
    if (score < 60) return 'progress-medium';
    return 'progress-high';
  };
  
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">{cohort.name}</h3>
        <div className={`text-xs px-2 py-0.5 rounded-full ${cohort.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {cohort.change >= 0 ? '+' : ''}{cohort.change}%
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Conversion Rate</span>
            <span className="font-medium">{cohort.conversionRate}%</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Friction Score</span>
            <span className="font-medium">{cohort.frictionScore}/100</span>
          </div>
          <Progress 
            value={cohort.frictionScore} 
            className="h-1.5" 
            indicatorClassName={getFrictionClass(cohort.frictionScore)} 
          />
        </div>
      </div>
    </div>
  );
};

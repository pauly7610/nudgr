
import React from 'react';
import { UserCohort } from '../data/mockData';
import { Progress } from '@/components/ui/progress';
import { Tag, BarChart2, ArrowRight } from 'lucide-react';

interface UserCohortCardProps {
  cohort: UserCohort;
  onClick?: () => void;
}

export const UserCohortCard: React.FC<UserCohortCardProps> = ({ cohort, onClick }) => {
  // Determine progress color based on friction score
  const getFrictionClass = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Determine if cohort has marketing context
  const hasMarketingContext = cohort.name.includes("Google") || 
                             cohort.name.includes("Social") || 
                             cohort.name.includes("Email") ||
                             cohort.name.includes("Campaign") ||
                             cohort.name.includes("Paid") ||
                             cohort.name.includes("Organic");
  
  return (
    <div 
      className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
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
            className={`h-1.5 ${getFrictionClass(cohort.frictionScore)}`}
          />
        </div>
        
        {hasMarketingContext && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <div className="flex items-center gap-1 mb-2">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-500">Marketing Context</span>
            </div>
            <div className="space-y-1">
              {cohort.name.includes("Google") && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Source:</span> Google Ads
                </div>
              )}
              {cohort.name.includes("Social") && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Campaign:</span> Q2 Social Retargeting
                </div>
              )}
              {cohort.name.includes("Email") && (
                <div className="text-xs">
                  <span className="text-muted-foreground">Email Campaign:</span> Monthly Newsletter
                </div>
              )}
              <div className="text-xs">
                <span className="text-muted-foreground">Market Segment:</span> High Intent
              </div>
            </div>
            
            <div className="mt-2 border-t border-dotted pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Element Friction Analysis</span>
                <button className="text-blue-500 flex items-center gap-0.5">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              
              {cohort.name.includes("Email") && (
                <div className="mt-1 p-1.5 bg-amber-50 rounded-sm text-xs text-amber-800">
                  <div className="font-medium">Top Friction Element:</div>
                  <div>Sign Up Form - Email Field (42% abandonment)</div>
                </div>
              )}
              
              {cohort.name.includes("Google") && (
                <div className="mt-1 p-1.5 bg-amber-50 rounded-sm text-xs text-amber-800">
                  <div className="font-medium">Top Friction Element:</div>
                  <div>Pricing Table - Enterprise Tier (58% drop-off)</div>
                </div>
              )}
              
              {cohort.name.includes("Social") && (
                <div className="mt-1 p-1.5 bg-amber-50 rounded-sm text-xs text-amber-800">
                  <div className="font-medium">Top Friction Element:</div>
                  <div>Product Demo CTA (36% rage clicks)</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button className="text-xs text-primary flex items-center gap-1">
            <BarChart2 className="h-3 w-3" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title,
  value,
  description,
  change,
  icon,
  className
}) => {
  return (
    <div className={cn("p-6 rounded-lg border bg-card", className)}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <div className="text-sm text-muted-foreground mt-1">{description}</div>
          )}
          {typeof change !== 'undefined' && (
            <div className={`flex items-center mt-2 text-sm font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
              <span className="text-muted-foreground ml-1">vs last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="rounded-lg p-2 bg-primary/10">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};


import React from 'react';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="bg-muted/25 border-b px-6 py-8">
      <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

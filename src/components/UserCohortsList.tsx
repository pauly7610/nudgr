
import React from 'react';
import { UserCohortCard } from '@/components/UserCohortCard';
import { UsersIcon } from 'lucide-react';
import { UserCohort } from '@/data/mockData';

interface UserCohortsListProps {
  cohorts: UserCohort[];
  activeTab: string;
  onSelectCohort: (cohortId: string) => void;
  onViewElementAnalytics: (cohortId: string) => void;
}

export const UserCohortsList: React.FC<UserCohortsListProps> = ({ 
  cohorts, 
  activeTab, 
  onSelectCohort,
  onViewElementAnalytics
}) => {
  // Filter cohorts based on active tab
  const filteredCohorts = activeTab === "all" 
    ? cohorts
    : cohorts.filter(cohort => {
        if (activeTab === "marketing") {
          return cohort.name.includes("Google") || 
                 cohort.name.includes("Social") || 
                 cohort.name.includes("Email");
        }
        return true;
      });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCohorts.map(cohort => (
        <UserCohortCard 
          key={cohort.id} 
          cohort={cohort} 
          onClick={() => onSelectCohort(cohort.id)}
          onViewAnalytics={onSelectCohort}
          onViewElementAnalytics={onViewElementAnalytics}
        />
      ))}
      
      {/* Empty cohort card for adding new one */}
      <div className="rounded-lg border border-dashed bg-card p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary/70 cursor-pointer transition-colors">
        <UsersIcon className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-center">Create a new visitor cohort to track and analyze</p>
        {activeTab === "marketing" && (
          <p className="text-xs text-center mt-2">
            Create cohorts based on campaigns, sources, or marketing touchpoints
          </p>
        )}
      </div>
    </div>
  );
};

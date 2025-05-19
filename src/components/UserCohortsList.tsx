
import React from 'react';
import { UserCohortCard } from '@/components/UserCohortCard';
import { UsersIcon } from 'lucide-react';
import { UserCohort } from '@/data/mockData';
import { Button } from '@/components/ui/button';

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

  // Empty state message
  const getEmptyStateMessage = () => {
    if (activeTab === "marketing") {
      return "No marketing cohorts found. Create a cohort based on marketing campaigns or sources.";
    } else if (activeTab === "element") {
      return "No element friction cohorts found. Create a cohort to track element-level user issues.";
    }
    return "No cohorts found. Create your first visitor cohort to start analysis.";
  };

  return (
    <>
      {filteredCohorts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <UsersIcon className="h-12 w-12 mb-3 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-1">No Cohorts Found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">{getEmptyStateMessage()}</p>
          <Button>Create Cohort</Button>
        </div>
      )}
    
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
          <p className="text-center font-medium">Create a new visitor cohort</p>
          <p className="text-xs text-center mt-2">
            {activeTab === "marketing" && "Track users from specific marketing campaigns or channels"}
            {activeTab === "element" && "Create cohorts to analyze element-level friction points"}
            {activeTab === "all" && "Group users by behavior, source, or demographics"}
          </p>
        </div>
      </div>
    </>
  );
};

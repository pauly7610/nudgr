
import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserCohortCard } from '@/components/UserCohortCard';
import { useFrictionData } from '@/hooks/useFrictionData';
import { UsersIcon, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserCohorts = () => {
  const { userCohorts } = useFrictionData();
  
  return (
    <>
      <DashboardHeader title="User Cohorts" description="Compare metrics across different user segments" />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Cohorts</h2>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>New Cohort</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCohorts.map(cohort => (
            <UserCohortCard key={cohort.id} cohort={cohort} />
          ))}
          
          {/* Empty cohort card for adding new one */}
          <div className="rounded-lg border border-dashed bg-card p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary/70 cursor-pointer transition-colors">
            <UsersIcon className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center">Create a new user cohort to track and analyze</p>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Cohort Comparison</h2>
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="p-6 text-center text-muted-foreground">
              <p>Select two or more cohorts above to compare their metrics</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCohorts;

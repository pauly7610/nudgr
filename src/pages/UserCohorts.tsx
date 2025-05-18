
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserCohortCard } from '@/components/UserCohortCard';
import { useFrictionData } from '@/hooks/useFrictionData';
import { UsersIcon, UserPlus, Tag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const UserCohorts = () => {
  const { userCohorts } = useFrictionData();
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Filter cohorts based on active tab
  const filteredCohorts = activeTab === "all" 
    ? userCohorts
    : userCohorts.filter(cohort => {
        if (activeTab === "marketing") {
          return cohort.name.includes("Google") || 
                 cohort.name.includes("Social") || 
                 cohort.name.includes("Email");
        }
        return true;
      });
  
  return (
    <>
      <DashboardHeader title="User Cohorts" description="Compare metrics across different user segments" />
      
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Cohorts</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>New Cohort</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Cohorts</TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Marketing Cohorts</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCohorts.map(cohort => (
            <UserCohortCard key={cohort.id} cohort={cohort} />
          ))}
          
          {/* Empty cohort card for adding new one */}
          <div className="rounded-lg border border-dashed bg-card p-6 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary/70 cursor-pointer transition-colors">
            <UsersIcon className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-center">Create a new user cohort to track and analyze</p>
            {activeTab === "marketing" && (
              <p className="text-xs text-center mt-2">
                Create cohorts based on campaigns, sources, or marketing touchpoints
              </p>
            )}
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
        
        {activeTab === "marketing" && (
          <div className="mt-12 bg-blue-50 rounded-lg border border-blue-100 p-6">
            <h2 className="text-lg font-semibold mb-3 text-blue-800">Marketing Audience Export</h2>
            <p className="text-sm text-blue-700 mb-4">
              Export cohorts to your marketing platforms for targeted campaigns and personalized experiences.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <h3 className="font-medium">Email Marketing</h3>
                <p className="text-xs text-muted-foreground mt-1">Export to your email platform for targeted campaigns</p>
              </div>
              <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <h3 className="font-medium">Ad Platforms</h3>
                <p className="text-xs text-muted-foreground mt-1">Create custom audiences for retargeting campaigns</p>
              </div>
              <div className="border bg-white rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                <h3 className="font-medium">CRM Systems</h3>
                <p className="text-xs text-muted-foreground mt-1">Sync cohort data with your customer database</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserCohorts;


import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserCohortCard } from '@/components/UserCohortCard';
import { useFrictionData } from '@/hooks/useFrictionData';
import { UsersIcon, UserPlus, Tag, Filter, BarChart2, MousePointer2, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingFunnelDiagnostics } from '@/components/MarketingFunnelDiagnostics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ElementFrictionAnalytics } from '@/components/ElementFrictionAnalytics';

const UserCohorts = () => {
  const { userCohorts, flows } = useFrictionData();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);
  const [showElementAnalytics, setShowElementAnalytics] = useState<boolean>(false);
  
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
  
  // Find selected cohort object
  const activeCohort = userCohorts.find(c => c.id === selectedCohort);
  
  // Find related flow (in a real app this would be from actual data)
  const flow = selectedCohort ? flows[0] : null;
  
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
            <TabsTrigger value="element" className="flex items-center gap-1">
              <MousePointer2 className="h-3.5 w-3.5" />
              <span>Element Friction</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCohorts.map(cohort => (
            <UserCohortCard 
              key={cohort.id} 
              cohort={cohort} 
              onClick={() => {
                setSelectedCohort(cohort.id);
                setShowElementAnalytics(false);
              }}
            />
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
        
        {activeCohort && !showElementAnalytics && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Cohort Analysis: {activeCohort.name}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCohort(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowElementAnalytics(true)}
                >
                  <MousePointer2 className="h-4 w-4" />
                  <span>Element Analysis</span>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Journey Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
                    <div className="text-center">
                      <BarChart2 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/70" />
                      <p className="text-muted-foreground">Select metrics to visualize cohort performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Friction Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Avg. Session Duration</span>
                      <span className="font-medium">4m 32s</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Rage Clicks</span>
                      <span className="font-medium">42</span>
                    </li>
                    <li className="flex justify-between items-center pb-2 border-b">
                      <span className="text-muted-foreground">Form Abandonment</span>
                      <span className="font-medium">23%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-muted-foreground">Error Encounters</span>
                      <span className="font-medium">8</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6">
              <MarketingFunnelDiagnostics flow={flow} />
            </div>
          </div>
        )}
        
        {activeCohort && showElementAnalytics && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Element Friction: {activeCohort.name}</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowElementAnalytics(false)}
                >
                  Back to Cohort
                </Button>
              </div>
            </div>
            
            <ElementFrictionAnalytics cohort={activeCohort} />
          </div>
        )}
        
        {!activeCohort && !selectedCohort && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Cohort Comparison</h2>
            <div className="rounded-lg border bg-card overflow-hidden">
              <div className="p-6 text-center text-muted-foreground">
                <p>Select two or more cohorts above to compare their metrics</p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "marketing" && !selectedCohort && (
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
        
        {activeTab === "element" && !selectedCohort && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Element-Level Interaction Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  Select a cohort above to view detailed element-level friction analytics, including click maps, 
                  hover patterns, and interaction times for specific UI components.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Click Maps</h3>
                    <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-2">
                      <MousePointer2 className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Identify confusing buttons or ineffective CTAs
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Hover Analysis</h3>
                    <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-2">
                      <MousePointer2 className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      See where users hesitate or get confused
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Form Field Analysis</h3>
                    <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-2">
                      <MousePointer2 className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Find problematic fields causing abandonment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default UserCohorts;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { UserCohort } from '../data/mockData';
import { MousePointer2, Gauge, Clock, AlertTriangle, MousePointerClick } from 'lucide-react';

interface ElementFrictionAnalyticsProps {
  cohort: UserCohort;
}

export const ElementFrictionAnalytics: React.FC<ElementFrictionAnalyticsProps> = ({ cohort }) => {
  const [activeTab, setActiveTab] = useState('click-map');

  // Mock data - in a real app this would come from actual analytics
  const getElementData = () => {
    if (cohort.name.includes("Email")) {
      return {
        pageName: "Newsletter Signup Page",
        topProblemElement: "Email Field",
        issueType: "Form Abandonment",
        abandonment: 42, 
        avgTimeSpent: 14.2,
        rageClicks: 24,
        errorEncounters: 18,
        screenshot: "/placeholder.svg"
      };
    }
    
    if (cohort.name.includes("Google")) {
      return {
        pageName: "Pricing Page",
        topProblemElement: "Enterprise Pricing Tier",
        issueType: "Excessive Scrolling",
        abandonment: 58, 
        avgTimeSpent: 8.7,
        rageClicks: 37,
        errorEncounters: 4,
        screenshot: "/placeholder.svg"
      };
    }
    
    return {
      pageName: "Product Demo Page",
      topProblemElement: "CTA Button",
      issueType: "Rage Clicks",
      abandonment: 36, 
      avgTimeSpent: 22.3,
      rageClicks: 52,
      errorEncounters: 7,
      screenshot: "/placeholder.svg"
    };
  };

  const elementData = getElementData();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Element Interaction Analysis</CardTitle>
          <CardDescription>
            Detailed analytics for UI elements on {elementData.pageName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rage Clicks</div>
                <div className="text-2xl font-bold">{elementData.rageClicks}</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg. Time Spent</div>
                <div className="text-2xl font-bold">{elementData.avgTimeSpent}s</div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Error Encounters</div>
                <div className="text-2xl font-bold">{elementData.errorEncounters}</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Top Problem Element</h3>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-amber-800">{elementData.topProblemElement}</span>
                  <span className="text-sm text-amber-700">
                    {elementData.abandonment}% {elementData.issueType}
                  </span>
                </div>
                <p className="text-sm text-amber-700 mb-3">
                  {cohort.name.includes("Email") && "Users are confused by email validation requirements"}
                  {cohort.name.includes("Google") && "Users struggle to find the enterprise pricing information"}
                  {cohort.name.includes("Social") && "CTA button appears non-clickable to many users"}
                </p>
                <div className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>High impact on conversion - Recommended for immediate A/B testing</span>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="click-map" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="click-map" className="flex items-center gap-1">
                  <MousePointer2 className="h-3.5 w-3.5" />
                  <span>Click Map</span>
                </TabsTrigger>
                <TabsTrigger value="hover-map" className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  <span>Hover Map</span>
                </TabsTrigger>
                <TabsTrigger value="scroll-map" className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Scroll & Time</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="click-map">
                <div className="border rounded-lg p-4">
                  <div className="relative w-full h-80 bg-muted/30 rounded border mb-4 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      {/* In a real app, this would show the page with click overlay */}
                      Click map visualization for {elementData.pageName}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      This click map shows where users are clicking on {elementData.pageName}. 
                      Red areas indicate high click concentration, with notable rage clicks on {elementData.topProblemElement}.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="hover-map">
                <div className="border rounded-lg p-4">
                  <div className="relative w-full h-80 bg-muted/30 rounded border mb-4 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      {/* In a real app, this would show the page with hover overlay */}
                      Hover map visualization for {elementData.pageName}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      This hover map shows where users are hovering their cursor on {elementData.pageName}.
                      Yellow/orange areas indicate longer hover times, suggesting user hesitation or confusion.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="scroll-map">
                <div className="border rounded-lg p-4">
                  <div className="relative w-full h-80 bg-muted/30 rounded border mb-4 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      {/* In a real app, this would show the page with scroll/time overlay */}
                      Scroll and time map for {elementData.pageName}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      This visualization shows how far users scroll down the page and how much time they 
                      spend at different sections. The average time spent on this page is {elementData.avgTimeSpent} seconds.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>
            AI-powered recommendations based on element friction analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Element: {elementData.topProblemElement}</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-500">
                    <MousePointer2 className="h-4 w-4" />
                  </div>
                  <div>
                    {cohort.name.includes("Email") && 
                      "Simplify email validation requirements and provide clearer inline guidance"}
                    {cohort.name.includes("Google") && 
                      "Make enterprise pricing information more prominent and reduce scrolling required"}
                    {cohort.name.includes("Social") && 
                      "Improve CTA button contrast and make it look more clickable"}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-500">
                    <MousePointer2 className="h-4 w-4" />
                  </div>
                  <div>
                    {cohort.name.includes("Email") && 
                      "Add option to continue with social sign-in to reduce form friction"}
                    {cohort.name.includes("Google") && 
                      "Add quick comparison tooltips to reduce the need to switch between pricing tiers"}
                    {cohort.name.includes("Social") && 
                      "Test different button copy that better matches user intent from social campaigns"}
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 text-green-500">
                    <MousePointer2 className="h-4 w-4" />
                  </div>
                  <div>
                    {cohort.name.includes("Email") && 
                      "Implement progressive disclosure - request email first, then additional information"}
                    {cohort.name.includes("Google") && 
                      "Create a dedicated landing page for AdWords campaigns focused on enterprise features"}
                    {cohort.name.includes("Social") && 
                      "Ensure ad copy and landing page messaging are consistent to meet expectations"}
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Marketing Campaign Impact</h3>
              <div className="text-sm text-blue-700">
                <p className="mb-2">
                  {cohort.name.includes("Email") && 
                    "The current email campaign \"Monthly Newsletter\" is driving traffic to a form that's causing significant friction. Consider revising the email to better set expectations."}
                  {cohort.name.includes("Google") && 
                    "Google Ads campaigns targeting enterprise customers are resulting in high friction on the pricing page. Consider creating dedicated landing pages with clearer enterprise value propositions."}
                  {cohort.name.includes("Social") && 
                    "Social media campaigns appear to set different expectations than what the landing page delivers. Align the campaign messaging with the actual product experience."}
                </p>
                <div className="font-medium">Suggested Next Steps:</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Create an A/B test for this element</li>
                  <li>Export this segment for targeted remarketing</li>
                  <li>Update campaign copy to better align with the user experience</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftRight, BarChart2, UserMinus, Users } from 'lucide-react';

export const CohortComparisonDocs: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cohort Comparison &amp; Analysis Documentation</CardTitle>
          <CardDescription>
            Learn how to use the cohort comparison and analysis features to identify friction points and optimize conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="comparison">Cohort Comparison</TabsTrigger>
              <TabsTrigger value="analysis">Cohort Analysis</TabsTrigger>
              <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Understanding User Cohorts</h3>
                <p className="text-muted-foreground mb-2">
                  User cohorts are groups of users that share common characteristics or behaviors.
                  The friction analysis platform allows you to create, compare, and analyze different cohorts
                  to identify where and why users are experiencing friction in their journey.
                </p>
                <p className="text-muted-foreground">
                  Cohorts can be based on various criteria such as:
                </p>
                <ul className="list-disc pl-6 space-y-1 mt-2 text-muted-foreground">
                  <li>Marketing source (Google Ads, Social Media, Email)</li>
                  <li>Demographic information</li>
                  <li>Device or browser type</li>
                  <li>Geographic location</li>
                  <li>Behavioral patterns</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Platform Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        <span>Cohort Comparison</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Compare metrics across multiple cohorts to identify performance gaps and optimization opportunities</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span>Detailed Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Dive deep into individual cohort performance with element-level friction analysis</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserMinus className="h-4 w-4" />
                        <span>Drop-off Tracking</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Identify where users abandon their journey and why it happens</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Collaborative Analysis</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Share insights with team members and collaborate on optimizations</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Cohort Comparison Features</h3>
                <p className="text-muted-foreground mb-4">
                  The cohort comparison tool allows you to select multiple cohorts and compare their performance 
                  across various metrics. This helps identify which segments are experiencing the most friction.
                </p>
                
                <h4 className="font-medium mb-2">How to Use Cohort Comparison</h4>
                <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Select cohorts:</strong> Choose two or more cohorts from the list to compare.
                  </li>
                  <li>
                    <strong>Choose comparison type:</strong> Toggle between "Conversion Metrics" and "Friction Metrics" 
                    to focus your analysis.
                  </li>
                  <li>
                    <strong>Analyze differences:</strong> Use the different tabs to compare metrics, analyze drop-offs, 
                    and visualize differences.
                  </li>
                  <li>
                    <strong>Share and export:</strong> Share your comparison with team members or export the data for 
                    further analysis.
                  </li>
                </ol>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Comparison Tabs Explained</h3>
                <div className="space-y-3">
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <h4 className="font-medium">Metric Comparison</h4>
                    <p className="text-sm text-muted-foreground">
                      Compare key metrics like conversion rate and friction score across cohorts in a tabular format.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <h4 className="font-medium">Drop-off Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualize where users from different cohorts drop off in their journey and identify significant differences.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <h4 className="font-medium">Visual Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      See graphical representations of key metrics to quickly spot patterns and differences between cohorts.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-primary pl-4 py-1">
                    <h4 className="font-medium">Collaborate</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your findings with team members and collaborate on solving friction issues.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Cohort Analysis in Depth</h3>
                <p className="text-muted-foreground mb-4">
                  Clicking on a single cohort takes you to a detailed analysis view where you can 
                  explore specific friction points and user behaviors within that segment.
                </p>
                
                <h4 className="font-medium mb-2">Analysis Capabilities</h4>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong>Journey Performance:</strong> Visualize how users in this cohort move through the journey funnel.
                  </li>
                  <li>
                    <strong>Friction Impact Score:</strong> Understand the severity and impact of friction points on conversion.
                  </li>
                  <li>
                    <strong>Element Analysis:</strong> Identify specific UI elements causing friction through heatmaps and interaction data.
                  </li>
                  <li>
                    <strong>Technical Errors:</strong> Uncover technical issues like JavaScript errors or slow loading times that affect this cohort.
                  </li>
                  <li>
                    <strong>Accessibility Issues:</strong> Detect accessibility problems that might be causing friction for users with disabilities.
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Working with Element Friction Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  The element friction analysis provides detailed insights into how users interact with specific 
                  elements on your pages.
                </p>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Common Element Friction Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm">Rage Clicks</p>
                      <p className="text-xs text-muted-foreground">
                        Multiple rapid clicks on the same element, indicating user frustration.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Error Rates</p>
                      <p className="text-xs text-muted-foreground">
                        Frequency of form validation errors or submission failures.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Hesitation Time</p>
                      <p className="text-xs text-muted-foreground">
                        Unusually long pauses before interacting with an element.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Abandonment Rate</p>
                      <p className="text-xs text-muted-foreground">
                        Percentage of users who leave after interacting with a specific element.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Key Metrics Explained</h3>
                <p className="text-muted-foreground mb-4">
                  Understanding the metrics used in cohort analysis is essential for making informed decisions.
                </p>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Conversion Rate</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      The percentage of users who complete the desired action (purchase, signup, etc.) 
                      out of the total number who started the journey.
                    </p>
                    <div className="text-xs bg-muted/30 p-2 rounded">
                      <code>Conversion Rate = (Completions ÷ Journey Starts) × 100</code>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Friction Score</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      A composite metric (0-100) that quantifies the amount of friction users experience, 
                      based on multiple signals including rage clicks, form errors, and session abandonment.
                    </p>
                    <div className="text-xs bg-muted/30 p-2 rounded">
                      <p>Higher scores indicate more friction. Scores are categorized as:</p>
                      <ul className="mt-1 space-y-1">
                        <li><span className="text-green-600">• Low (0-30):</span> Minimal friction</li>
                        <li><span className="text-yellow-600">• Medium (30-60):</span> Moderate friction</li>
                        <li><span className="text-red-600">• High (60-100):</span> Severe friction</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Drop-off Rate</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      The percentage of users who abandon the journey at a specific step.
                    </p>
                    <div className="text-xs bg-muted/30 p-2 rounded">
                      <code>Drop-off Rate at Step X = (Users who left at Step X ÷ Users who entered Step X) × 100</code>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Change Percentage</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      The relative change in a metric compared to a previous time period or baseline.
                    </p>
                    <div className="text-xs bg-muted/30 p-2 rounded">
                      <code>Change % = ((Current Value - Previous Value) ÷ Previous Value) × 100</code>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    Compare similar cohorts (e.g., traffic sources, demographics) to isolate variables.
                  </li>
                  <li>
                    Look for patterns across multiple metrics to identify root causes of friction.
                  </li>
                  <li>
                    Use visual analytics to quickly spot outliers and trends.
                  </li>
                  <li>
                    Share findings with cross-functional teams to develop comprehensive solutions.
                  </li>
                  <li>
                    Track changes over time to measure the impact of optimizations.
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

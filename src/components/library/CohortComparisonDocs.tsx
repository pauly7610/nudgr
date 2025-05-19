import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, BarChart2, ArrowLeftRight, UserMinus } from 'lucide-react';
import { CohortComparison } from '../comparison/CohortComparison';

interface CohortComparisonDocsProps {
  searchTerm?: string;
}

export const CohortComparisonDocs: React.FC<CohortComparisonDocsProps> = ({ searchTerm = '' }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Cohort Comparison Documentation
          </CardTitle>
          <CardDescription>
            Learn how to effectively compare user cohorts to identify friction points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">What is Cohort Comparison?</h3>
            <p className="text-muted-foreground mb-4">
              Cohort comparison allows you to analyze differences between user segments to identify where 
              specific groups encounter friction in your product or website.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Metric Comparison</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compare conversion rates and friction scores between different user segments
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserMinus className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Drop-off Analysis</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Identify where specific cohorts are abandoning your flows
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Visual Analytics</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Visualize differences in metrics across selected cohorts
                </p>
              </div>
            </div>
          </div>
          
          {searchTerm && (
            <div className="mb-6 p-3 bg-muted rounded-lg">
              <p className="text-sm">
                Showing results for: <span className="font-medium">{searchTerm}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CohortComparison />
    </div>
  );
};

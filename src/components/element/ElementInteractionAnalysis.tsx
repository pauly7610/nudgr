
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, MousePointer2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ElementInteractionAnalysis: React.FC = () => {
  return (
    <div className="mt-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Element-Level Interaction Analysis
          </CardTitle>
          <CardDescription>
            Analyze how users interact with specific UI components on your site
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">How to use Element Analysis</h3>
                <p className="text-sm text-blue-700">
                  Select a cohort from above to see detailed interaction data for specific UI elements.
                  This analysis helps identify which components are causing friction in your user experience.
                </p>
              </div>
            </div>
          </div>
          
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
              <Button variant="link" size="sm" className="text-xs mt-2">
                Learn more
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Hover Analysis</h3>
              <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-2">
                <MousePointer2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                See where users hesitate or get confused
              </p>
              <Button variant="link" size="sm" className="text-xs mt-2">
                Learn more
              </Button>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Form Field Analysis</h3>
              <div className="h-20 bg-muted/30 rounded-md flex items-center justify-center mb-2">
                <MousePointer2 className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">
                Find problematic fields causing abandonment
              </p>
              <Button variant="link" size="sm" className="text-xs mt-2">
                Learn more
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

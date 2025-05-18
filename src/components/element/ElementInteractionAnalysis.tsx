
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MousePointer2 } from 'lucide-react';

export const ElementInteractionAnalysis: React.FC = () => {
  return (
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
  );
};

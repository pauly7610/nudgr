
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LibraryWelcomeMessageProps {
  onDismiss: () => void;
}

export const LibraryWelcomeMessage: React.FC<LibraryWelcomeMessageProps> = ({ onDismiss }) => {
  return (
    <Card className="mb-6 relative border-l-4 border-l-primary">
      <CardContent className="pt-6 pb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2" 
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-full">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1">Welcome to the Resource Library</h3>
            <p className="text-muted-foreground mb-4">
              This library contains resources to help you optimize your user journeys, 
              understand cohort behavior, and implement best practices for 
              reducing friction in your application.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">Marketing Playbooks</h4>
                <p className="text-sm text-muted-foreground">Ready-to-implement strategies for reducing friction in your marketing flows</p>
              </div>
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">Cohort Analysis</h4>
                <p className="text-sm text-muted-foreground">Learn how to compare different user segments to identify patterns</p>
              </div>
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">Journey Mapping</h4>
                <p className="text-sm text-muted-foreground">Best practices for creating and analyzing user journey maps</p>
              </div>
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-1">Technical Docs</h4>
                <p className="text-sm text-muted-foreground">Technical guides for implementing friction reduction solutions</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

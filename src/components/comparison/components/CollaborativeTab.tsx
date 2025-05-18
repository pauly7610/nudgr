
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JourneyCollab } from '@/components/JourneyCollab';
import { Flow } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface CollaborativeTabProps {
  sharedLink: string;
  flow: Flow;
}

export const CollaborativeTab: React.FC<CollaborativeTabProps> = ({
  sharedLink,
  flow,
}) => {
  const { toast } = useToast();
  
  return (
    <div className="p-6">
      <h3 className="font-medium mb-3">Collaborative Analysis</h3>
      <p className="text-muted-foreground mb-4">
        Work with your team to analyze and resolve friction issues
      </p>
      
      {sharedLink && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium mb-2">Shareable Link</div>
          <div className="flex gap-2">
            <Input value={sharedLink} readOnly className="flex-1" />
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(sharedLink);
                toast({
                  title: "Copied!",
                  description: "Link copied to clipboard",
                });
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
      
      <JourneyCollab flow={flow} />
    </div>
  );
};

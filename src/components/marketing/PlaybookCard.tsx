
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCategoryBadgeStyle, getImplementationStyle } from './utils/playbookUtils';
import { MarketingPlaybook } from './types/marketingPlaybookTypes';

interface PlaybookCardProps {
  playbook: MarketingPlaybook;
  onViewPlaybook: (playbook: MarketingPlaybook) => void;
}

export const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, onViewPlaybook }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={getCategoryBadgeStyle(playbook.category)}>
            {playbook.category.replace('_', ' ')}
          </Badge>
          <Badge variant="outline">
            +{playbook.conversionLift}% lift
          </Badge>
        </div>
        <CardTitle className="mt-2">{playbook.title}</CardTitle>
        <CardDescription>{playbook.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Implementation complexity:</p>
            <p className={`font-medium ${getImplementationStyle(playbook.implementationTime)}`}>
              {playbook.implementationTime.charAt(0).toUpperCase() + playbook.implementationTime.slice(1)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-1">Key friction addressed:</p>
            <p className="font-medium">
              {playbook.frictionType.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => onViewPlaybook(playbook)}
            >
              View Playbook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

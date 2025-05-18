
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlaybookCard } from '../PlaybookCard';
import { MarketingPlaybook } from '../types/marketingPlaybookTypes';
import { Button } from '@/components/ui/button';

interface PlaybookListProps {
  playbooks: MarketingPlaybook[];
  onViewPlaybook: (playbook: MarketingPlaybook) => void;
  onRequestCustom: () => void;
}

export const PlaybookList: React.FC<PlaybookListProps> = ({ 
  playbooks, 
  onViewPlaybook,
  onRequestCustom
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Recommended Playbooks</h3>
        <Button variant="ghost" size="sm" className="h-7" onClick={onRequestCustom}>
          Request Custom
        </Button>
      </div>
      
      <ScrollArea className="h-[380px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-4">
          {playbooks.map((playbook) => (
            <PlaybookCard 
              key={playbook.id}
              playbook={playbook}
              onViewPlaybook={() => onViewPlaybook(playbook)}
            />
          ))}
          
          {playbooks.length === 0 && (
            <div className="col-span-2 flex items-center justify-center py-8 text-center text-muted-foreground">
              <div>
                <p>No playbooks match your search</p>
                <p className="text-sm mt-1">Try adjusting your filters or search term</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

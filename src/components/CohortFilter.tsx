
import React from 'react';
import { UserCohort } from '../data/mockData';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface CohortFilterProps {
  cohorts: UserCohort[];
  activeCohortId: string | null;
  onSelect: (cohortId: string | null) => void;
  onClose: () => void;
}

export const CohortFilter: React.FC<CohortFilterProps> = ({ 
  cohorts, 
  activeCohortId, 
  onSelect, 
  onClose 
}) => {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter by User Cohort</DialogTitle>
          <DialogDescription>
            Select a user cohort to filter the journey data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 my-4 max-h-[400px] overflow-y-auto">
          <div 
            className={`p-3 border rounded-md cursor-pointer ${
              !activeCohortId ? 'bg-blue-50 border-blue-300' : ''
            }`}
            onClick={() => onSelect(null)}
          >
            <div className="font-medium">All Users</div>
            <div className="text-sm text-muted-foreground">View data from all user cohorts</div>
          </div>
          
          {cohorts.map(cohort => (
            <div 
              key={cohort.id}
              className={`p-3 border rounded-md cursor-pointer ${
                cohort.id === activeCohortId ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => onSelect(cohort.id)}
            >
              <div className="font-medium">{cohort.name}</div>
              <div className="text-sm text-muted-foreground">{cohort.description}</div>
              <div className="text-xs mt-1">{cohort.users.toLocaleString()} users</div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Apply Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

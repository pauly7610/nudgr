
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart } from 'lucide-react';
import { UserCohort } from '@/data/mockData';

interface MetricComparisonTabProps {
  compareType: string;
  setCompareType: (type: string) => void;
  selectedCohorts: UserCohort[];
  onCohortSelect: (cohortId: string) => void;
}

export const MetricComparisonTab: React.FC<MetricComparisonTabProps> = ({
  compareType,
  setCompareType,
  selectedCohorts,
  onCohortSelect,
}) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button 
            variant={compareType === "conversion" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareType("conversion")}
            className="flex items-center gap-1"
          >
            <BarChart className="h-4 w-4" />
            <span>Conversion Metrics</span>
          </Button>
          <Button 
            variant={compareType === "friction" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareType("friction")}
            className="flex items-center gap-1"
          >
            <BarChart className="h-4 w-4" />
            <span>Friction Metrics</span>
          </Button>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 border-b bg-muted/50">
          <div className="p-3 font-medium">Cohort</div>
          <div className="p-3 font-medium">Conversion Rate</div>
          <div className="p-3 font-medium">Friction Score</div>
          <div className="p-3 font-medium">Change</div>
        </div>
        
        {selectedCohorts.map(cohort => (
          <div key={cohort.id} className="grid grid-cols-4 border-b last:border-0">
            <div className="p-3">
              <div className="font-medium">{cohort.name}</div>
            </div>
            <div className="p-3">{cohort.conversionRate}%</div>
            <div className="p-3">
              <div className="flex items-center gap-2">
                <span>{cohort.frictionScore}/100</span>
                <Badge variant={cohort.frictionScore < 30 ? "secondary" : cohort.frictionScore < 60 ? "outline" : "destructive"}>
                  {cohort.frictionScore < 30 ? "Low" : cohort.frictionScore < 60 ? "Medium" : "High"}
                </Badge>
              </div>
            </div>
            <div className="p-3">
              <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${cohort.change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {cohort.change >= 0 ? '+' : ''}{cohort.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <div className="text-sm text-muted-foreground">
          Selected {selectedCohorts.length} cohorts for comparison
        </div>
        <div className="flex gap-2 mt-2">
          {selectedCohorts.map(cohort => (
            <Badge key={cohort.id} variant="outline" className="flex items-center gap-1">
              {cohort.name}
              <button 
                className="ml-1 hover:bg-muted rounded-full"
                onClick={() => onCohortSelect(cohort.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

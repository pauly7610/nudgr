
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFrictionData } from '@/hooks/useFrictionData';
import { 
  Download,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CohortSelectionPanel } from './components/CohortSelectionPanel';
import { ComparisonTabs } from './components/ComparisonTabs';

export const CohortComparison: React.FC = () => {
  const { toast } = useToast();
  const { userCohorts, flows } = useFrictionData();
  const [selectedCohortIds, setSelectedCohortIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("compare");
  const [compareType, setCompareType] = useState<string>("conversion");
  const [sharedLink, setSharedLink] = useState<string>('');
  
  const handleCohortSelect = (cohortId: string) => {
    if (selectedCohortIds.includes(cohortId)) {
      setSelectedCohortIds(selectedCohortIds.filter(id => id !== cohortId));
    } else {
      setSelectedCohortIds([...selectedCohortIds, cohortId]);
    }
  };
  
  const handleShareComparison = () => {
    const baseUrl = window.location.origin;
    const shareableLink = `${baseUrl}/shared/cohort-comparison?ids=${selectedCohortIds.join(',')}`;
    setSharedLink(shareableLink);
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link Copied",
        description: "Shareable comparison link has been copied to clipboard",
      });
    });
  };
  
  // Get selected cohorts
  const selectedCohorts = userCohorts.filter(cohort => 
    selectedCohortIds.includes(cohort.id)
  );
  
  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Cohort Comparison</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedCohortIds.length < 2}
            onClick={handleShareComparison}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Comparison</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            disabled={selectedCohortIds.length < 2}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </div>
      
      {selectedCohortIds.length < 2 ? (
        <CohortSelectionPanel
          userCohorts={userCohorts}
          selectedCohortIds={selectedCohortIds}
          onCohortSelect={handleCohortSelect}
        />
      ) : (
        <ComparisonTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          compareType={compareType}
          setCompareType={setCompareType}
          selectedCohorts={selectedCohorts}
          onCohortSelect={handleCohortSelect}
          sharedLink={sharedLink}
          flow={flows[0]}
        />
      )}
    </div>
  );
};

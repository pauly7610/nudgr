
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFrictionData } from '@/hooks/useFrictionData';
import { 
  ArrowLeftRight, 
  UserMinus, 
  BarChart2, 
  Users, 
  BarChart,
  Download,
  Share2
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { JourneyCollab } from '@/components/JourneyCollab';

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
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Select Cohorts to Compare</h3>
              <p className="text-muted-foreground">Choose at least two cohorts to analyze differences in metrics and friction points</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {userCohorts.map(cohort => (
                <div 
                  key={cohort.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedCohortIds.includes(cohort.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleCohortSelect(cohort.id)}
                >
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      checked={selectedCohortIds.includes(cohort.id)}
                      onCheckedChange={() => handleCohortSelect(cohort.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{cohort.name}</div>
                      <div className="flex items-center gap-2 mt-1 text-sm">
                        <div className="text-muted-foreground">
                          Conv: {cohort.conversionRate}%
                        </div>
                        <div className="text-muted-foreground">
                          Friction: {cohort.frictionScore}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-muted/50 px-4 pt-3 border-b">
              <TabsList>
                <TabsTrigger value="compare" className="flex items-center gap-1">
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>Metric Comparison</span>
                </TabsTrigger>
                <TabsTrigger value="difference" className="flex items-center gap-1">
                  <UserMinus className="h-4 w-4" />
                  <span>Drop-off Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="charts" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  <span>Visual Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="collaborate" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Collaborate</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="compare" className="p-0">
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
                    Selected {selectedCohortIds.length} cohorts for comparison
                  </div>
                  <div className="flex gap-2 mt-2">
                    {selectedCohorts.map(cohort => (
                      <Badge key={cohort.id} variant="outline" className="flex items-center gap-1">
                        {cohort.name}
                        <button 
                          className="ml-1 hover:bg-muted rounded-full"
                          onClick={() => handleCohortSelect(cohort.id)}
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
            </TabsContent>
            
            <TabsContent value="difference" className="p-0">
              <div className="p-6">
                <h3 className="font-medium mb-3">Drop-off Difference Analysis</h3>
                <p className="text-muted-foreground mb-4">
                  Compare where users are dropping off between different cohorts
                </p>
                
                <div className="h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2">Flow step comparison visualization will appear here</div>
                    <p className="text-sm">Shows where drop-offs differ between cohorts</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="p-0">
              <div className="p-6">
                <h3 className="font-medium mb-3">Visual Comparison</h3>
                <p className="text-muted-foreground mb-4">
                  Visualize differences in metrics across selected cohorts
                </p>
                
                <div className="h-64 flex items-center justify-center border rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2">Charts comparing friction metrics will appear here</div>
                    <p className="text-sm">Bar and line charts showing key metrics side-by-side</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="collaborate" className="p-0">
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
                
                <JourneyCollab flow={flows[0]} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};


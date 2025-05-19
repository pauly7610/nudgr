
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BestPracticeLibrary } from '@/components/library/BestPracticeLibrary';
import { CohortComparisonDocs } from '@/components/library/CohortComparisonDocs';
import { DocsNavigation } from '@/components/library/DocsNavigation';
import { MarketingPlaybooks } from '@/components/marketing/MarketingPlaybooks';
import { LibraryWelcomeMessage } from '@/components/library/LibraryWelcomeMessage';
import { Card } from '@/components/ui/card';
import { BookOpen, Users, Map, Code } from 'lucide-react';
import { PlaybookFilter } from '@/components/marketing/components/PlaybookFilter';

const Library = () => {
  const location = useLocation();
  const pathname = location.pathname;
  
  // Set default tab based on URL
  const getDefaultTab = () => {
    if (pathname.includes('cohort-comparison')) return 'cohort-comparison';
    if (pathname.includes('journey-mapping')) return 'journey-mapping';
    if (pathname.includes('technical')) return 'technical';
    return 'playbooks';
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Unified filter options for consistency
  const filterOptions = [
    { value: 'playbooks', label: 'Marketing Playbooks', icon: BookOpen },
    { value: 'cohort-comparison', label: 'Cohort Analysis', icon: Users },
    { value: 'journey-mapping', label: 'Journey Mapping', icon: Map },
    { value: 'technical', label: 'Technical Docs', icon: Code }
  ];

  const handleDismissWelcome = () => {
    setShowWelcome(false);
  };

  // Reset search when changing tabs
  useEffect(() => {
    setSearchTerm('');
  }, [activeTab]);

  return (
    <>
      <DashboardHeader 
        title="Resource Library" 
        description="Best practices, playbooks, and documentation"
      />
      
      <div className="container py-8">
        {showWelcome && <LibraryWelcomeMessage onDismiss={handleDismissWelcome} />}
        
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-64 flex-shrink-0 p-4">
            <h3 className="font-medium mb-3">Resource Categories</h3>
            <DocsNavigation activeSection={activeTab} onSelectSection={setActiveTab} />
          </Card>
          
          <div className="flex-1">
            <PlaybookFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={activeTab}
              onCategoryChange={setActiveTab}
              filterOptions={filterOptions}
              variant="tabs"
              className="mb-6"
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="playbooks" className="mt-0">
                <MarketingPlaybooks initialSearchTerm={searchTerm} />
              </TabsContent>
              
              <TabsContent value="cohort-comparison" className="mt-0">
                <CohortComparisonDocs searchTerm={searchTerm} />
              </TabsContent>
              
              <TabsContent value="journey-mapping" className="mt-0">
                <BestPracticeLibrary category="journey-mapping" searchTerm={searchTerm} />
              </TabsContent>
              
              <TabsContent value="technical" className="mt-0">
                <BestPracticeLibrary category="technical" searchTerm={searchTerm} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Library;

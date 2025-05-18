
import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { BestPracticeLibrary } from '@/components/library/BestPracticeLibrary';
import { DocsNavigation } from '@/components/library/DocsNavigation';
import { CohortComparisonDocs } from '@/components/library/CohortComparisonDocs';
import { useLocation } from 'react-router-dom';

const Library = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2] || '';
  
  // Render the appropriate documentation based on the current path
  const renderDocContent = () => {
    switch (currentPath) {
      case 'cohort-comparison':
        return <CohortComparisonDocs />;
      case 'journey-mapping':
        // This would be another doc component that could be added later
        return <div className="p-6 text-center text-muted-foreground">Journey mapping documentation coming soon</div>;
      case 'technical':
        // This would be another doc component that could be added later
        return <div className="p-6 text-center text-muted-foreground">Technical guides coming soon</div>;
      default:
        return <BestPracticeLibrary />;
    }
  };
  
  return (
    <>
      <DashboardHeader 
        title="Documentation Library" 
        description="Best practices, guidance, and examples for optimizing user journeys"
      />
      
      <div className="container py-8">
        <DocsNavigation activePage={currentPath} />
        
        {renderDocContent()}
      </div>
    </>
  );
};

export default Library;

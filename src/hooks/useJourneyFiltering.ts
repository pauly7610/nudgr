
import { useState, useMemo } from 'react';
import { Flow } from '../data/mockData';
import { ScopeFilter } from '../components/journey/FrictionScopeFilter';

export const useJourneyFiltering = (flow: Flow | null) => {
  const [showMarketingData, setShowMarketingData] = useState(false);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>({});
  const [showScopeFilter, setShowScopeFilter] = useState(false);
  
  const hasFiltersApplied = useMemo(() => {
    return Object.values(scopeFilter).some(arr => arr && arr.length > 0);
  }, [scopeFilter]);
  
  const filteredSteps = useMemo(() => {
    if (!flow) return [];
    
    return flow.steps.filter(step => {
      // Mock implementation of filtering logic
      const matchesVertical = !scopeFilter.pageVertical?.length || 
        scopeFilter.pageVertical.some(v => step.label.toLowerCase().includes(v.toLowerCase()));
      
      const matchesSection = !scopeFilter.pageSection?.length || 
        scopeFilter.pageSection.some(s => {
          // This would use actual data in a real implementation
          if (s === 'Form' && step.label.includes('Form')) return true;
          if (s === 'Pricing Table' && step.label.includes('Detail')) return true;
          if (s === 'CTA' && step.label.includes('Booking')) return true;
          return false;
        });
      
      const matchesPurpose = !scopeFilter.pagePurpose?.length ||
        scopeFilter.pagePurpose.some(p => {
          if (p === 'Conversion' && step.label.includes('Booking')) return true;
          if (p === 'Lead Gen' && step.label.includes('Home')) return true;
          return false;
        });
      
      return matchesVertical && matchesSection && matchesPurpose;
    });
  }, [flow, scopeFilter]);
  
  return {
    showMarketingData,
    setShowMarketingData,
    expandedStepIndex,
    setExpandedStepIndex,
    scopeFilter,
    setScopeFilter,
    showScopeFilter,
    setShowScopeFilter,
    hasFiltersApplied,
    filteredSteps
  };
};

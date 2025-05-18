import { useState, useEffect } from 'react';
import { Alert, Flow, UserCohort, flowData, initialAlerts, userCohorts as initialUserCohorts, generateRandomAlert } from '../data/mockData';

export interface FrictionDataState {
  flows: Flow[];
  alerts: Alert[];
  userCohorts: UserCohort[];
  activeFlowId: string | null;
  setActiveFlowId: (id: string | null) => void;
  activeAlert: Alert | null;
  setActiveAlert: (alert: Alert | null) => void;
  createFlow: (flowData: Omit<Flow, 'id'>) => string;
  getMarketingContext: (flowId: string) => any | null;
  getFrictionImpactScore: (flowId: string) => number;
  getTopFrictionElements: () => Array<{elementName: string; score: number; flowId: string}>;
}

export const useFrictionData = (): FrictionDataState => {
  const [flows, setFlows] = useState<Flow[]>(flowData);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [userCohorts, setUserCohorts] = useState<UserCohort[]>(initialUserCohorts);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

  // Simulate real-time alert generation
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateRandomAlert();
      setAlerts(prev => [newAlert, ...prev.slice(0, 49)]); // Keep max 50 alerts
    }, 15000 + Math.random() * 30000); // Random interval between 15-45 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Add extra marketing cohorts to the initial set
  useEffect(() => {
    const marketingCohorts: UserCohort[] = [
      {
        id: "cohort-4",
        name: "Google Ads - Search",
        conversionRate: 12.8,
        frictionScore: 52,
        change: -0.8
      },
      {
        id: "cohort-5",
        name: "Social Media - Facebook",
        conversionRate: 7.2,
        frictionScore: 68,
        change: -4.3
      },
      {
        id: "cohort-6",
        name: "Email Newsletter",
        conversionRate: 18.9,
        frictionScore: 41,
        change: 2.7
      }
    ];
    
    setUserCohorts([...initialUserCohorts, ...marketingCohorts]);
  }, []);
  
  // Function to create a new flow
  const createFlow = (flowData: Omit<Flow, 'id'>) => {
    const newId = `flow-${Date.now()}`;
    const newFlow: Flow = {
      id: newId,
      ...flowData
    };
    
    setFlows(prevFlows => [...prevFlows, newFlow]);
    return newId;
  };

  // Function to get marketing context for a flow
  const getMarketingContext = (flowId: string) => {
    // In a real app this would fetch actual marketing data
    return {
      campaignName: "Summer Sale 2023",
      source: "Google Ads",
      medium: "CPC",
      adGroup: "Product X - High Intent",
      adCreative: "50% Off Limited Time",
      landingPage: "/summer-promo"
    };
  };

  // Calculate friction impact score for a flow
  const getFrictionImpactScore = (flowId: string): number => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return 0;
    
    // Calculate impact score based on:
    // 1. Drop-off rates
    // 2. Number of friction types
    // 3. User volume
    
    // Get first and last step
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    
    // Calculate overall drop-off rate
    const dropOffRate = (firstStep.users - lastStep.users) / firstStep.users;
    
    // Count total friction issues
    const frictionIssues = flow.steps.reduce((count, step) => {
      return count + (step.friction?.length || 0);
    }, 0);
    
    // Calculate normalized user volume factor (0-1 scale)
    const maxUsers = Math.max(...flows.map(f => f.steps[0].users));
    const userVolumeFactor = firstStep.users / maxUsers;
    
    // Calculate impact score (0-100 scale)
    // weightings: 50% drop-off rate, 30% friction issues, 20% user volume
    const impactScore = 
      (dropOffRate * 50) + 
      (Math.min(frictionIssues / 10, 1) * 30) + 
      (userVolumeFactor * 20);
    
    return Math.round(impactScore);
  };
  
  // Get top friction elements across all flows
  const getTopFrictionElements = () => {
    const elements: Array<{elementName: string; score: number; flowId: string}> = [];
    
    flows.forEach(flow => {
      flow.steps.forEach(step => {
        if (step.friction && step.friction.length > 0) {
          const stepImpact = step.dropOff || 0;
          const userVolume = step.users;
          
          // Create an impact score for this specific element
          const elementScore = Math.round((stepImpact / userVolume * 100) * (step.friction.length * 0.2));
          
          elements.push({
            elementName: `${flow.flow} - ${step.label}`,
            score: elementScore,
            flowId: flow.id
          });
        }
      });
    });
    
    // Sort by impact score (highest first)
    return elements.sort((a, b) => b.score - a.score);
  };

  return {
    flows,
    alerts,
    userCohorts,
    activeFlowId,
    setActiveFlowId,
    activeAlert,
    setActiveAlert,
    createFlow,
    getMarketingContext,
    getFrictionImpactScore,
    getTopFrictionElements
  };
};

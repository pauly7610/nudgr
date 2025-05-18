
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

  return {
    flows,
    alerts,
    userCohorts,
    activeFlowId,
    setActiveFlowId,
    activeAlert,
    setActiveAlert,
    createFlow,
    getMarketingContext
  };
};

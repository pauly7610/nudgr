
import { useEffect, useMemo, useState } from 'react';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';
import { useProductAnalyticsSummary } from '@/hooks/useProductAnalytics';
import {
  Alert,
  Flow,
  UserCohort,
  flowData as demoFlowData,
  initialAlerts as demoAlerts,
  userCohorts as demoUserCohorts,
} from '../data/mockData';

export interface FrictionDataState {
  flows: Flow[];
  alerts: Alert[];
  userCohorts: UserCohort[];
  activeFlowId: string | null;
  setActiveFlowId: (id: string | null) => void;
  activeAlert: Alert | null;
  setActiveAlert: (alert: Alert | null) => void;
  createFlow: (flowData: Omit<Flow, 'id'>) => string;
  getMarketingContext: (flowId: string) => Record<string, string> | null;
  getFrictionImpactScore: (flowId: string) => number;
  getTopFrictionElements: () => Array<{elementName: string; score: number; flowId: string}>;
}

export const useFrictionData = (): FrictionDataState => {
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: analyticsSummary } = useProductAnalyticsSummary(30, selectedProperty?.id ?? null);
  const [customFlows, setCustomFlows] = useState<Flow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const demoDataEnabled = import.meta.env.VITE_DEMO_DATA === 'true';

  const liveFlows = useMemo<Flow[]>(() => {
    return analyticsSummary?.journeys ?? [];
  }, [analyticsSummary?.journeys]);

  const flows = useMemo<Flow[]>(() => {
    const baseFlows = liveFlows.length > 0
      ? liveFlows
      : demoDataEnabled
        ? demoFlowData
        : [];

    return [...baseFlows, ...customFlows];
  }, [customFlows, demoDataEnabled, liveFlows]);

  const alerts = useMemo<Alert[]>(() => {
    if (analyticsSummary?.alerts?.length) {
      return analyticsSummary.alerts.map((alert) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
    }

    return demoDataEnabled ? demoAlerts : [];
  }, [analyticsSummary?.alerts, demoDataEnabled]);

  const userCohorts = useMemo<UserCohort[]>(() => {
    if (analyticsSummary?.cohorts?.length) {
      return analyticsSummary.cohorts;
    }

    if (!demoDataEnabled) {
      return [];
    }

    return [
      ...demoUserCohorts,
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
  }, [analyticsSummary?.cohorts, demoDataEnabled]);

  useEffect(() => {
    if (flows.length === 0) {
      if (activeFlowId !== null) {
        setActiveFlowId(null);
      }
      return;
    }

    if (!activeFlowId || !flows.some((flow) => flow.id === activeFlowId)) {
      setActiveFlowId(flows[0].id);
    }
  }, [activeFlowId, flows]);
  
  // Function to create a new flow
  const createFlow = (newFlowData: Omit<Flow, 'id'>) => {
    const newId = `flow-${Date.now()}`;
    const newFlow: Flow = {
      id: newId,
      ...newFlowData
    };
    
    setCustomFlows(prevFlows => [...prevFlows, newFlow]);
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
    // 3. Visitor volume
    
    // Get first and last step
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    
    // Calculate overall drop-off rate
    const dropOffRate = (firstStep.users - lastStep.users) / firstStep.users;
    
    // Count total friction issues
    const frictionIssues = flow.steps.reduce((count, step) => {
      return count + (step.friction?.length || 0);
    }, 0);
    
    // Calculate normalized visitor volume factor (0-1 scale)
    const maxUsers = Math.max(...flows.map(f => f.steps[0].users));
    const userVolumeFactor = firstStep.users / maxUsers;
    
    // Calculate impact score (0-100 scale)
    // weightings: 50% drop-off rate, 30% friction issues, 20% visitor volume
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

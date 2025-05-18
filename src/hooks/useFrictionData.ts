
import { useState, useEffect } from 'react';
import { Alert, Flow, UserCohort, flowData, initialAlerts, userCohorts, generateRandomAlert } from '../data/mockData';

export interface FrictionDataState {
  flows: Flow[];
  alerts: Alert[];
  userCohorts: UserCohort[];
  activeFlowId: string | null;
  setActiveFlowId: (id: string | null) => void;
  activeAlert: Alert | null;
  setActiveAlert: (alert: Alert | null) => void;
  createFlow: (flowData: Omit<Flow, 'id'>) => string;
}

export const useFrictionData = (): FrictionDataState => {
  const [flows, setFlows] = useState<Flow[]>(flowData);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
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

  return {
    flows,
    alerts,
    userCohorts,
    activeFlowId,
    setActiveFlowId,
    activeAlert,
    setActiveAlert,
    createFlow
  };
};

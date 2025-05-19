
import React, { useState, useEffect } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { FrictionAlertBanner } from './FrictionAlertBanner';
import { StatsCard } from './StatsCard';
import { TopFrictionFunnels } from './TopFrictionFunnels';
import { AlertsFeed } from './AlertsFeed';
import { UserCohortCard } from './UserCohortCard';
import { JourneyFrictionMap } from './JourneyFrictionMap';
import { FrictionImpactScore } from './FrictionImpactScore';
import { useFrictionData } from '../hooks/useFrictionData';
import { BarChart2, Zap, Users } from 'lucide-react';
import { Alert } from '../data/mockData';
import { JourneyAnalysisPanel } from './JourneyAnalysisPanel';
import { SmartActionNudges } from './SmartActionNudges';
import { SmartTestPlanner } from './testing/SmartTestPlanner';

export const FrictionDashboard: React.FC = () => {
  const {
    flows,
    alerts,
    userCohorts,
    activeFlowId,
    setActiveFlowId,
    activeAlert,
    setActiveAlert
  } = useFrictionData();
  
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  
  // Calculate total visitors from all flows (first step)
  const totalVisitors = flows.reduce((acc, flow) => acc + flow.steps[0].users, 0);
  
  // Calculate average drop-off rate
  const avgDropOffRate = flows.reduce((acc, flow) => {
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    const dropOffRate = (firstStep.users - lastStep.users) / firstStep.users;
    return acc + dropOffRate;
  }, 0) / flows.length * 100;
  
  // Calculate friction index (total friction events / total visitors)
  const totalFrictionEvents = flows.reduce((acc, flow) => {
    return acc + flow.steps.reduce((stepAcc, step) => {
      return stepAcc + (step.friction?.length || 0);
    }, 0);
  }, 0);
  
  const frictionIndex = (totalFrictionEvents / flows.length) * 10;
  
  // Find active flow
  const activeFlow = flows.find(f => f.id === activeFlowId) || null;
  
  // Handle alert view
  const handleAlertView = (alert: Alert) => {
    setActiveAlert(alert);
    setLatestAlert(null);
    setActiveFlowId(alert.flowId);
  };
  
  // Handle alert dismissal
  const handleAlertDismiss = (alert: Alert) => {
    setLatestAlert(null);
    setDismissedAlertIds(prev => {
      const newSet = new Set(prev);
      newSet.add(alert.id);
      return newSet;
    });
  };
  
  // New alert display
  useEffect(() => {
    if (alerts.length > 0) {
      // Find the first alert that hasn't been dismissed
      const newAlert = alerts.find(alert => !dismissedAlertIds.has(alert.id));
      
      if (newAlert && (!latestAlert || newAlert.id !== latestAlert.id)) {
        setLatestAlert(newAlert);
      }
    }
  }, [alerts, latestAlert, dismissedAlertIds]);
  
  return (
    <>
      {latestAlert && (
        <FrictionAlertBanner 
          alert={latestAlert} 
          onView={handleAlertView}
          onDismiss={() => handleAlertDismiss(latestAlert)} 
        />
      )}
      
      <DashboardHeader 
        title="Friction Dashboard" 
        description="Monitor and analyze visitor friction points"
      />
      
      <div className="container py-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Total Visitors Tracked"
            value={totalVisitors.toLocaleString()}
            description="Across all funnels"
            change={4.2}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          
          <StatsCard 
            title="Average Drop-off Rate"
            value={`${Math.round(avgDropOffRate)}%`}
            description="From first to last step"
            change={-2.8}
            icon={<BarChart2 className="h-5 w-5 text-primary" />}
          />
          
          <StatsCard 
            title="Friction Index"
            value={frictionIndex.toFixed(1)}
            description="Overall experience score"
            change={1.5}
            icon={<Zap className="h-5 w-5 text-primary" />}
          />
        </div>
        
        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TopFrictionFunnels 
              flows={flows} 
              onFlowClick={setActiveFlowId} 
              activeFlowId={activeFlowId}
            />
            
            <JourneyFrictionMap flow={activeFlow} />
            
            {activeFlow && (
              <>
                <JourneyAnalysisPanel flow={activeFlow} />
                <div className="max-w-2xl space-y-6 mt-0">
                  <SmartActionNudges />
                  <SmartTestPlanner />
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-6">
            <FrictionImpactScore showTopElements={true} />
          
            <AlertsFeed alerts={alerts} onAlertClick={handleAlertView} />
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Visitor Cohorts</h3>
              <div className="grid gap-4">
                {userCohorts.slice(0, 3).map(cohort => (
                  <UserCohortCard key={cohort.id} cohort={cohort} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

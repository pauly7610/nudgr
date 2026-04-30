
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
import { BarChart2, ShieldAlert, ShieldCheck, Users, Zap } from 'lucide-react';
import { Alert } from '../data/mockData';
import { JourneyAnalysisPanel } from './JourneyAnalysisPanel';
import { SmartActionNudges } from './SmartActionNudges';
import { SmartTestPlanner } from './testing/SmartTestPlanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useDashboardWidgets } from '@/hooks/useDashboardWidgets';
import { useTokenHygieneSummary } from '@/hooks/useTokenHygieneSummary';
import { useProductAnalyticsSummary } from '@/hooks/useProductAnalytics';
import { ProductAnalyticsPulse } from './ProductAnalyticsPulse';
import { useAnalyticsPropertyContext } from '@/contexts/AnalyticsPropertyContext';

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
  const { selectedProperty } = useAnalyticsPropertyContext();
  const { data: tokenHygieneSummary, isLoading: isTokenHygieneLoading } = useTokenHygieneSummary();
  const selectedAnalyticsPropertyId = selectedProperty?.id ?? null;
  const { data: analyticsSummary, isLoading: isAnalyticsLoading } = useProductAnalyticsSummary(30, selectedAnalyticsPropertyId);
  const enabledWidgets = useDashboardWidgets();
  
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  
  // Calculate total visitors from all flows (first step)
  const totalVisitors = flows.reduce((acc, flow) => acc + flow.steps[0].users, 0);
  
  // Calculate average drop-off rate
  const avgDropOffRate = flows.length > 0 ? flows.reduce((acc, flow) => {
    const firstStep = flow.steps[0];
    const lastStep = flow.steps[flow.steps.length - 1];
    const dropOffRate = firstStep.users > 0 ? (firstStep.users - lastStep.users) / firstStep.users : 0;
    return acc + dropOffRate;
  }, 0) / flows.length * 100 : 0;
  
  // Calculate friction index (total friction events / total visitors)
  const totalFrictionEvents = flows.reduce((acc, flow) => {
    return acc + flow.steps.reduce((stepAcc, step) => {
      return stepAcc + (step.friction?.length || 0);
    }, 0);
  }, 0);
  
  const frictionIndex = flows.length > 0 ? (totalFrictionEvents / flows.length) * 10 : 0;
  const productSessions = analyticsSummary?.summary.sessions ?? totalVisitors;
  const productEvents = analyticsSummary?.summary.events ?? totalFrictionEvents;
  const productFrictionScore = analyticsSummary?.summary.frictionScore ?? Math.max(0, Math.round(100 - frictionIndex));
  const tokenSummary = tokenHygieneSummary?.summary;
  const showAuthTokenHygieneWidget = enabledWidgets.some((widget) => widget.id === 'auth-token-hygiene');
  
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
        description={`Monitor and analyze visitor friction points${selectedProperty ? ` for ${selectedProperty.name}` : ''}`}
      />
      
      <div className="container py-4 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Product Sessions"
            value={productSessions.toLocaleString()}
            description={analyticsSummary ? `${analyticsSummary.summary.uniquePages} surfaces observed` : 'Across demo funnels'}
            change={4.2}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          
          <StatsCard 
            title="Event Volume"
            value={productEvents.toLocaleString()}
            description={analyticsSummary ? `${analyticsSummary.summary.highFrictionEvents} high-friction signals` : `${Math.round(avgDropOffRate)}% demo drop-off`}
            change={-2.8}
            icon={<BarChart2 className="h-5 w-5 text-primary" />}
          />
          
          <StatsCard 
            title="Friction Score"
            value={productFrictionScore}
            description={analyticsSummary ? 'Higher is healthier' : 'Demo-derived score'}
            change={1.5}
            icon={<Zap className="h-5 w-5 text-primary" />}
          />
        </div>

        <ProductAnalyticsPulse analytics={analyticsSummary} isLoading={isAnalyticsLoading} />

        {showAuthTokenHygieneWidget && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <CardTitle>Auth Token Hygiene</CardTitle>
              </div>
              <CardDescription>
                Refresh-token security posture across the last {tokenHygieneSummary?.windowDays ?? 30} days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTokenHygieneLoading && (
                <p className="text-sm text-muted-foreground">Loading auth token metrics...</p>
              )}

              {!isTokenHygieneLoading && !tokenSummary && (
                <p className="text-sm text-muted-foreground">
                  Token hygiene metrics are unavailable right now.
                </p>
              )}

              {!isTokenHygieneLoading && tokenSummary && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-md border p-3 bg-muted/20">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Active</div>
                      <div className="text-2xl font-semibold">{tokenSummary.activeTokens}</div>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/20">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Revoked</div>
                      <div className="text-2xl font-semibold">{tokenSummary.revokedTokens}</div>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/20">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Expired</div>
                      <div className="text-2xl font-semibold">{tokenSummary.expiredTokens}</div>
                    </div>
                    <div className="rounded-md border p-3 bg-muted/20">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Reuse Alerts</div>
                      <div className="text-2xl font-semibold">{tokenSummary.reuseDetections}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>Issued: {tokenSummary.issuedTokens}</span>
                    <span>Rotated: {tokenSummary.rotatedTokens}</span>
                    <span>Logout Revocations: {tokenSummary.logoutRevocations}</span>
                  </div>

                  {tokenSummary.reuseDetections > 0 && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
                      <ShieldAlert className="h-4 w-4 mt-0.5" />
                      <p className="text-sm">
                        Reuse detections indicate attempted replay of old refresh tokens. Investigate unusual sign-in activity.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
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

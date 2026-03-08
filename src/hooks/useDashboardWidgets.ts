import { useState } from 'react';

interface Widget {
  id: string;
  name: string;
  description: string;
  component: string;
  enabled: boolean;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'friction-summary', name: 'Friction Summary', description: 'Key metrics overview', component: 'StatsCard', enabled: true },
  { id: 'auth-token-hygiene', name: 'Auth Token Hygiene', description: 'Refresh token security posture', component: 'AuthTokenHygiene', enabled: true },
  { id: 'top-friction', name: 'Top Friction Points', description: 'Most critical friction events', component: 'TopFrictionFunnels', enabled: true },
  { id: 'recent-alerts', name: 'Recent Alerts', description: 'Latest friction alerts', component: 'AlertsFeed', enabled: true },
  { id: 'session-recordings', name: 'Session Recordings', description: 'Recent user sessions', component: 'SessionRecordings', enabled: false },
  { id: 'heatmap', name: 'Heatmap Viewer', description: 'Interaction heatmaps', component: 'HeatmapViewer', enabled: false },
  { id: 'ai-insights', name: 'AI Insights', description: 'AI-powered recommendations', component: 'AIInsightsPanel', enabled: false },
  { id: 'journey-map', name: 'Journey Map', description: 'User journey visualization', component: 'JourneyFrictionMap', enabled: false },
  { id: 'ab-tests', name: 'A/B Tests', description: 'Active experiments', component: 'ABTestManager', enabled: false },
];

export const useDashboardWidgets = () => {
  const [widgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  return widgets.filter((widget) => widget.enabled);
};

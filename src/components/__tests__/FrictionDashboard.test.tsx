import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@/test/test-utils';
import { screen } from '@testing-library/dom';
import { FrictionDashboard } from '../FrictionDashboard';

vi.mock('../FrictionAlertBanner', () => ({
  FrictionAlertBanner: () => <div />,
}));

vi.mock('../TopFrictionFunnels', () => ({
  TopFrictionFunnels: () => <div />,
}));

vi.mock('../AlertsFeed', () => ({
  AlertsFeed: () => <div />,
}));

vi.mock('../UserCohortCard', () => ({
  UserCohortCard: () => <div />,
}));

vi.mock('../JourneyFrictionMap', () => ({
  JourneyFrictionMap: () => <div />,
}));

vi.mock('../FrictionImpactScore', () => ({
  FrictionImpactScore: () => <div />,
}));

vi.mock('../JourneyAnalysisPanel', () => ({
  JourneyAnalysisPanel: () => <div />,
}));

vi.mock('../SmartActionNudges', () => ({
  SmartActionNudges: () => <div />,
}));

vi.mock('../testing/SmartTestPlanner', () => ({
  SmartTestPlanner: () => <div />,
}));

vi.mock('../DashboardHeader', () => ({
  DashboardHeader: () => <div />,
}));

vi.mock('@/hooks/useFrictionData', () => ({
  useFrictionData: () => ({
    flows: [
      {
        id: 'flow-1',
        flow: 'Test Flow',
        steps: [
          { label: 'Landing', users: 100 },
          { label: 'Checkout', users: 60, dropOff: 40, friction: ['rage_clicks'] },
        ],
      },
    ],
    alerts: [],
    userCohorts: [],
    activeFlowId: null,
    setActiveFlowId: vi.fn(),
    activeAlert: null,
    setActiveAlert: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTokenHygieneSummary', () => ({
  useTokenHygieneSummary: () => ({
    data: {
      windowDays: 30,
      summary: {
        issuedTokens: 10,
        activeTokens: 2,
        revokedTokens: 8,
        rotatedTokens: 6,
        expiredTokens: 1,
        logoutRevocations: 3,
        reuseDetections: 0,
      },
    },
    isLoading: false,
  }),
}));

describe('FrictionDashboard auth token hygiene widget', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides auth token hygiene card when widget is disabled', () => {
    localStorage.setItem(
      'dashboard_widgets',
      JSON.stringify([
        { id: 'friction-summary', enabled: true },
        { id: 'auth-token-hygiene', enabled: false },
      ])
    );

    render(<FrictionDashboard />);

    expect(screen.queryByText('Auth Token Hygiene')).not.toBeInTheDocument();
  });

  it('shows auth token hygiene card when widget is enabled', () => {
    localStorage.setItem(
      'dashboard_widgets',
      JSON.stringify([
        { id: 'friction-summary', enabled: true },
        { id: 'auth-token-hygiene', enabled: true },
      ])
    );

    render(<FrictionDashboard />);

    expect(screen.getByText('Auth Token Hygiene')).toBeInTheDocument();
    expect(screen.getByText('Issued: 10')).toBeInTheDocument();
  });
});

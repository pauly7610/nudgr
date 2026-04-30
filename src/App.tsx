import { Suspense, lazy } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CommandPalette } from './components/CommandPalette';
import './App.css';
import { Outlet } from 'react-router-dom';
import { OnboardingGuide } from './components/onboarding/OnboardingGuide';
import { useAnalytics } from './hooks/useAnalytics';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { isAuthDisabled } from './lib/authMode';

const Index = lazy(() => import('./pages/Index'));
const JourneyMap = lazy(() => import('./pages/JourneyMap'));
const Metrics = lazy(() => import('./pages/Metrics'));
const Library = lazy(() => import('./pages/Library'));
const Settings = lazy(() => import('./pages/Settings'));
const Integrations = lazy(() => import('./pages/Integrations'));
const Connect = lazy(() => import('./pages/Connect'));
const UserCohorts = lazy(() => import('./pages/UserCohorts'));
const Auth = lazy(() => import('./pages/Auth'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Pricing = lazy(() => import('./pages/Pricing'));
const MonitoringDashboard = lazy(() =>
  import('./components/monitoring/MonitoringDashboard').then((module) => ({ default: module.MonitoringDashboard }))
);
const SecurityDashboard = lazy(() =>
  import('./components/security/SecurityDashboard').then((module) => ({ default: module.SecurityDashboard }))
);

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
    Loading DreamFi...
  </div>
);

function App() {
  useAnalytics();
  usePerformanceMonitor();
  const authDisabled = isAuthDisabled();
  
  return (
    <ErrorBoundary>
      <CommandPalette />
      <OnboardingGuide />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/auth" element={authDisabled ? <Navigate to="/" replace /> : <Auth />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route index element={<Index />} />
            <Route path="journey-map" element={<JourneyMap />} />
            <Route path="metrics" element={<Metrics />} />
            <Route path="library" element={<Library />} />
            <Route path="library/cohort-comparison" element={<Library />} />
            <Route path="library/journey-mapping" element={<Library />} />
            <Route path="library/technical" element={<Library />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="connect" element={<Connect />} />
            <Route path="settings" element={<Settings />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="user-cohorts" element={<UserCohorts />} />
            <Route path="monitoring" element={<MonitoringDashboard />} />
            <Route path="security" element={<SecurityDashboard />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

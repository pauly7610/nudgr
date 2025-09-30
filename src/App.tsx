
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Index from './pages/Index';
import JourneyMap from './pages/JourneyMap';
import Metrics from './pages/Metrics';
import Library from './pages/Library';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import UserCohorts from './pages/UserCohorts';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import './App.css';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
        <Route index element={<Index />} />
        <Route path="journey-map" element={<JourneyMap />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="library" element={<Library />} />
        <Route path="library/cohort-comparison" element={<Library />} />
        <Route path="library/journey-mapping" element={<Library />} />
        <Route path="library/technical" element={<Library />} />
        <Route path="settings" element={<Settings />} />
        <Route path="integrations" element={<Integrations />} />
        <Route path="user-cohorts" element={<UserCohorts />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

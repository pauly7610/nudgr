
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Index from './pages/Index';
import JourneyMap from './pages/JourneyMap';
import Metrics from './pages/Metrics';
import Library from './pages/Library';
import Settings from './pages/Settings';
import UserCohorts from './pages/UserCohorts';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        <Route path="journey-map" element={<JourneyMap />} />
        <Route path="metrics" element={<Metrics />} />
        <Route path="library" element={<Library />} />
        <Route path="library/cohort-comparison" element={<Library />} />
        <Route path="library/journey-mapping" element={<Library />} />
        <Route path="library/technical" element={<Library />} />
        <Route path="settings" element={<Settings />} />
        <Route path="user-cohorts" element={<UserCohorts />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

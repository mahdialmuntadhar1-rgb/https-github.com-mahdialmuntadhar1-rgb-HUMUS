import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CommandCenter from './pages/CommandCenter';
import ReviewTable from './pages/ReviewTable';
import DiscoveryFeed from './pages/DiscoveryFeed';
import Overview from './pages/Overview';
import FinalReport from './pages/FinalReport';
import PilotRuns from './pages/PilotRuns';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" theme="dark" richColors />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/command" replace />} />
          <Route path="/command" element={<CommandCenter />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/review" element={<ReviewTable />} />
          <Route path="/discovery" element={<DiscoveryFeed />} />
          <Route path="/report" element={<FinalReport />} />
          <Route path="/pilot" element={<PilotRuns />} />
        </Route>
      </Routes>
    </Router>
  );
}

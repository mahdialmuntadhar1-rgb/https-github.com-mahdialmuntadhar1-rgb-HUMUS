/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Scraper from '@/pages/Scraper';
import Review from '@/pages/Review';
import BusinessDashboard from '@/components/dashboard/BusinessDashboard';
import ShakumakuAdmin from '@/components/admin/ShakumakuAdmin';
import './styles/humus-design.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Homepage with MyCity and Shakumaku tabs */}
        <Route path="/" element={<HomePage />} />

        {/* Existing Scraper Pages */}
        <Route path="/scraper" element={<Scraper />} />
        <Route path="/review" element={<Review />} />

        {/* Business Dashboard */}
        <Route path="/dashboard" element={<BusinessDashboard />} />

        {/* Shakumaku Admin Panel */}
        <Route path="/admin/shakumaku" element={<ShakumakuAdmin />} />

        {/* Catch-all 404 route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

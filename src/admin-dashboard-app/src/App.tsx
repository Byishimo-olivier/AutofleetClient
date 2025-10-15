import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import VehicleManagement from './pages/admin/VehicleManagement';
import BookingsManagement from './pages/admin/BookingsManagement';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import DisputesSupport from './pages/admin/DisputesSupport';
import SystemSettings from './pages/admin/SystemSettings';
import NotificationsCenter from './pages/admin/NotificationsCenter';
import { SettingProvider } from './contexts/SettingContext';

const App: React.FC = () => {
  return (
    <SettingProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/vehicles" element={<VehicleManagement />} />
          <Route path="/admin/bookings" element={<BookingsManagement />} />
          <Route path="/admin/reports" element={<ReportsAnalytics />} />
          <Route path="/admin/disputes" element={<DisputesSupport />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/notifications" element={<NotificationsCenter />} />
        </Routes>
      </Router>
    </SettingProvider>
  );
};

export default App;
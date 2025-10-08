import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Dashboard from '../../pages/admin/pages/Dashboard';
import UserManagement from '../../pages/admin/pages/UserManagement';
import VehicleManagement from '../../pages/admin/pages/VehicleManagement';
import BookingsManagement from '../../pages/admin/pages/BookingsManagement';
import ReportsAnalytics from '../../pages/admin/pages/ReportsAnalytics';
import DisputesSupport from '../../pages/admin/pages/DisputesSupport';
import SystemSettings from '../../pages/admin/pages/SystemSettings';
import NotificationsCenter from '../../pages/admin/pages/NotificationsCenter';
import ProfileAccount from '../../pages/admin/pages/ProfileAccount';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/vehicles" element={<VehicleManagement />} />
            <Route path="/admin/bookings" element={<BookingsManagement />} />
            <Route path="/admin/reports" element={<ReportsAnalytics />} />
            <Route path="/admin/disputes" element={<DisputesSupport />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/notifications" element={<NotificationsCenter />} />
            <Route path="/profile" element={<ProfileAccount />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
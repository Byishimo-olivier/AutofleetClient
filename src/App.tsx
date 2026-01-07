import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider, useSettings } from "@/contexts/SettingContxt";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import VehiclesPage from "@/pages/dashboard/AddVehiclesPage";
import Booking from "@/pages/dashboard/Booking";
import FeedbackPage from "@/pages/dashboard/FeedbackPage";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import MyBookingsFeedbackPage from "@/pages/customer/MyBookingsFeedbackPage";
import Vehicle from "@/pages/customer/VehiclesPage";
import BOOKINGPAGE from "@/pages/customer/BookingPage";
import SupportPage from "@/pages/customer/SupportPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import SidebarLayout from "@/components/layout/SidebarLayout";
import HomePage from "@/pages/HomePage";
import "./App.css";
import NavBar from "@/components/layout/Navbar";
import ChatBot from "@/components/chatbot/ChatBot";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import VehicleManagementPage from "@/pages/admin/VehicleManagementPage";
import BookingsManagementPage from "@/pages/admin/BookingsManagementPage";
import ReportsAnalyticsPage from "@/pages/admin/ReportsAnalyticsPage";
import DisputesSupportPage from "@/pages/admin/DisputesSupportPage";
import SystemSettingsPage from "@/pages/admin/SystemSettingsPage";
import NotificationsCenterPage from "@/pages/admin/NotificationsCenterPage";

// Components
// ...existing code...

// Component to handle conditional NavBar rendering
const ConditionalNavBar: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  // Define routes where NavBar should be hidden regardless of settings
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(location.pathname);
  // Show NavBar based on settings and current route
  const shouldShowNavBar = settings?.showNavBar !== false && !isAuthRoute;
  return shouldShowNavBar ? <NavBar /> : null;
};

// Component to handle conditional ChatBot rendering
const ConditionalChatBot: React.FC = () => {
  const { settings } = useSettings();
  const location = useLocation();
  // Define routes where ChatBot should be hidden
  const excludedRoutes = ['/login', '/register', '/'];
  const isExcludedRoute = excludedRoutes.includes(location.pathname);
  // Show ChatBot based on settings and current route
  const shouldShowChatBot = settings?.showChatBot !== false && !isExcludedRoute;
  return shouldShowChatBot ? <ChatBot /> : null;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ConditionalNavBar />
          <Routes>
            {/* Owner/Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <SidebarLayout>
                    <DashboardPage />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Management-vehicles" 
              element={
                <ProtectedRoute allowedRoles={[ 'owner', 'admin']}>
                  <SidebarLayout>
                    <VehiclesPage />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/booking" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin', 'customer']}>
                  <SidebarLayout>
                    <Booking />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <SidebarLayout>
                    <FeedbackPage />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <SidebarLayout>
                    <AnalyticsPage />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['owner', 'customer', 'admin']}>
                  <SidebarLayout>
                    <ProfilePage />
                  </SidebarLayout>
                </ProtectedRoute>
              } 
            />
            {/* Customer Pages */}
            <Route 
              path="/MyBookings" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyBookingsFeedbackPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Vehicles" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Vehicle />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Booking/:vehicleId" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BOOKINGPAGE />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Booking" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <BOOKINGPAGE />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/Support" 
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <SupportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<HomePage />} 
            />
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            <Route 
              path="/register" 
              element={<RegisterPage />} 
            />
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <UserManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/vehicles" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <VehicleManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <BookingsManagementPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <ReportsAnalyticsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/disputes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <DisputesSupportPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <SystemSettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/notifications" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <NotificationsCenterPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            {/* Catch all route - redirect to home for unauthenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ConditionalChatBot />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

export type Settings = {
  // ...other settings properties
  showNavBar?: boolean;
  showChatBot?: boolean;
};


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingContxt';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ChatBot from './components/chatbot/ChatBot'; // Add this import
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingPage from './pages/customer/BookingPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage';
import VehicleManagementPage from './pages/admin/VehicleManagementPage';
import BookingsManagementPage from './pages/admin/BookingsManagementPage';
import ReportsAnalyticsPage from './pages/admin/ReportsAnalyticsPage';
import DisputesSupportPage from './pages/admin/DisputesSupportPage';
import SystemSettingsPage from './pages/admin/SystemSettingsPage';
import NotificationsCenterPage from './pages/admin/NotificationsCenterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import FeedbackPage from './pages/dashboard/FeedbackPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookingsFeedbackPage from './pages/customer/MyBookingsFeedbackPage';
import SupportPage from './pages/customer/SupportPage';
import VehiclePage from './pages/customer/VehiclesPage';
import Booking from './pages/dashboard/BookingPage';
import AddVehiclesPage from './pages/dashboard/AddVehiclesPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

                {/* Customer Pages */}
                <Route path="/home" element={<CustomerDashboard />} />
                <Route path="/vehicle" element={<VehiclePage />} />
                <Route path="/customer/booking/:id" element={<BookingPage />} />
                <Route path="/customer/my-bookings" element={<MyBookingsFeedbackPage />} />
                <Route path="/customer/support" element={<SupportPage />} />

                {/* Protected Routes */}
                <Route 
                  path="/booking/:vehicleId" 
                  element={
                    <ProtectedRoute>
                      <BookingPage />
                    </ProtectedRoute>
                  } 
                /> 
                <Route 
                  path="/Vehicles" 
                  element={
                    <ProtectedRoute>
                      <AddVehiclesPage />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/booking" 
                  element={
                    <ProtectedRoute>
                      <Booking />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/feedback/*" 
                  element={
                    <ProtectedRoute>
                      <FeedbackPage />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/analytics/*" 
                  element={
                    <ProtectedRoute>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  } 
                />

                <Route path="/profile/*" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/vehicles" element={<VehicleManagementPage />} />
                <Route path="/admin/bookings" element={<BookingsManagementPage />} />
                <Route path="/admin/reports" element={<ReportsAnalyticsPage />} />
                <Route path="/admin/disputes" element={<DisputesSupportPage />} />
                <Route path="/admin/settings" element={<SystemSettingsPage />} />
                <Route path="/admin/notifications" element={<NotificationsCenterPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Add ChatBot component here */}
            <ChatBot />
          </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;


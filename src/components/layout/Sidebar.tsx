import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Users, Car, ClipboardList, PieChart, MessageCircle, Sliders, AlertCircle, User, LogOut, Settings } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

const adminNav = [
  { icon: <BarChart2 className="w-5 h-5" />, label: "Dashboard", to: "/admin" },
  { icon: <Users className="w-5 h-5" />, label: "User Management", to: "/admin/users" },
  { icon: <Car className="w-5 h-5" />, label: "Vehicle Management", to: "/admin/vehicles" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings Management", to: "/admin/bookings" },
  { icon: <PieChart className="w-5 h-5" />, label: "Reports & Analytics", to: "/admin/reports" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Disputes & Support", to: "/admin/disputes" },
  { icon: <Sliders className="w-5 h-5" />, label: "System Settings", to: "/admin/settings" },
  { icon: <AlertCircle className="w-5 h-5" />, label: "Notifications Center", to: "/admin/notifications" },
  { icon: <User className="w-5 h-5" />, label: "Profile & Account", to: "/profile" },
];

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'owner' | 'admin';
  created_at: string;
  last_login?: string;
  is_active?: boolean;
}

interface SidebarProps {
  onNavClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Generate user initials
  const generateInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get role display text and color
  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      admin: { text: 'ADMIN', color: 'text-red-300' },
      owner: { text: 'OWNER', color: 'text-green-300' },
      customer: { text: 'USER', color: 'text-blue-300' }
    };
    return roleConfig[role as keyof typeof roleConfig] || { text: 'USER', color: 'text-blue-300' };
  };

  // Check if token exists and is valid
  const checkAuthentication = () => {
    const token = localStorage.getItem('autofleet_token');

    if (!token) {
      console.log('🔄 No token found, redirecting to login...');
      setIsAuthenticated(false);
      return false;
    }

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        console.log('🔄 Token expired, redirecting to login...');
        localStorage.removeItem('autofleet_token');
        localStorage.removeItem('autofleet_user');
        setIsAuthenticated(false);
        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      localStorage.removeItem('autofleet_token');
      localStorage.removeItem('autofleet_user');
      setIsAuthenticated(false);
      return false;
    }
  };

  // Fetch user profile using the /auth/profile endpoint
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching admin user profile...');

      const response = await apiClient.get('/auth/profile');

      if (response.success) {
        setUserProfile(response.data as UserProfile);
        console.log('✅ Admin user profile fetched successfully:', response.data);

        // Store user profile in localStorage for quick access
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        setError('Failed to fetch user profile');
        console.error('❌ Failed to fetch profile:', response.message);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);
      setError(error.message || 'Failed to fetch profile');

      // If unauthorized, clear auth and redirect
      if (error.status === 401 || error.status === 403) {
        console.log('🔄 Unauthorized access, clearing auth...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log('🔄 Admin logging out...');

      // Optional: Call logout endpoint if you have one
      try {
        await apiClient.post('/auth/logout');
      } catch (logoutError) {
        console.log('⚠️ Logout endpoint not available or failed');
      }

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Reset state
      setUserProfile(null);
      setIsAuthenticated(false);

      console.log('✅ Admin logout successful');
      navigate('/login');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still clear local data even if logout call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUserProfile(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // Initial authentication check
  useEffect(() => {
    const isAuth = checkAuthentication();

    if (isAuth) {
      // Try to load user from localStorage first
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserProfile(parsedUser);
          console.log('✅ Admin user profile loaded from localStorage');
        } catch (error) {
          console.error('❌ Error parsing stored user data:', error);
          localStorage.removeItem('user');
        }
      }

      // Always fetch fresh profile data
      fetchUserProfile();
    }
  }, []);

  // Handle redirect when not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  // Retry profile fetch
  const retryFetch = () => {
    if (checkAuthentication()) {
      fetchUserProfile();
    }
  };

  // Show loading screen during initial auth check
  if (isAuthenticated === null) {
    return (
      <aside className="w-64 h-full bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-gray-300 text-sm">Checking authentication...</p>
          </div>
        </div>
      </aside>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <aside className="w-64 h-full bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-300 text-sm">Redirecting to login...</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-full bg-[#2c3e7d] text-white flex flex-col shadow-lg">
      {/* Header */}
      <div className="px-4 py-6 border-b border-[#3d4f8f]">
        <h1 className="text-xl font-bold">AutoFleet Hub</h1>
        <p className="text-sm text-gray-300 mt-1">Admin Panel</p>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3d4f8f]">
        {loading ? (
          // Loading state
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-gray-400 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-400 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-500 rounded animate-pulse w-16"></div>
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-300">Profile Error</div>
              <button
                onClick={retryFetch}
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : userProfile ? (
          // Profile loaded
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-lg">
              {generateInitials(userProfile.first_name, userProfile.last_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">
                {userProfile.first_name} {userProfile.last_name}
              </div>
              <div className={`text-xs tracking-wide font-medium ${getRoleDisplay(userProfile.role).color}`}>
                {getRoleDisplay(userProfile.role).text}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {userProfile.email}
              </div>
            </div>
          </div>
        ) : (
          // Fallback state
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Loading...</div>
              <div className="text-xs text-blue-300 tracking-wide">ADMIN</div>
            </div>
          </div>
        )}
      </div>

      {/* User Status & Info */}
      {userProfile && (
        <div className="px-4 py-3 border-b border-[#3d4f8f]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Online</span>
            <div className="ml-auto text-xs text-gray-400">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-2">
            <div className="text-xs text-gray-300 mb-1">Account Info</div>
            <div className="flex justify-between text-xs">
              <span className="text-green-300">
                Status: {userProfile.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-blue-300">
                ID: {userProfile.id}
              </span>
            </div>
            {userProfile.phone && (
              <div className="text-xs text-gray-300 mt-1">
                Phone: {userProfile.phone}
              </div>
            )}
            {userProfile.last_login && (
              <div className="text-xs text-gray-400 mt-1">
                Last login: {new Date(userProfile.last_login).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {adminNav.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 mb-1
            ${location.pathname === item.to
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105"
                : "text-gray-300 hover:bg-[#3d4f8f] hover:text-white hover:transform hover:scale-105"
              }`}
            onClick={() => {
              navigate(item.to);
              if (onNavClick) onNavClick();
            }}
          >
            <div className={`p-1 rounded ${location.pathname === item.to ? 'bg-white/20' : ''}`}>
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* User Actions */}
      <div className="px-3 pb-3 space-y-2">
        {/* Profile Settings Button */}
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition font-medium text-sm"
        >
          <Settings className="mr-2 w-4 h-4" /> Settings
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white py-2.5 rounded-lg transition font-medium text-sm shadow-md"
        >
          <LogOut className="mr-2 w-4 h-4" /> Logout
        </button>

        {/* Footer info */}
        <div className="text-center pt-2">
          <div className="text-xs text-gray-500">
            Admin Panel v2.1.0
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
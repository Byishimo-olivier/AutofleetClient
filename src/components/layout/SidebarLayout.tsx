import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2, Car, ClipboardList, MessageCircle, Users, User, LogOut, Settings, AlertCircle
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

const navItems = [
  { icon: <BarChart2 className="w-5 h-5" />, label: "Dashboard", to: "/dashboard" },
  { icon: <Car className="w-5 h-5" />, label: "Vehicles", to: "/Management-vehicles" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings", to: "/booking" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Feedback", to: "/feedback" },
  { icon: <Users className="w-5 h-5" />, label: "Analytics", to: "/analytics" },
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
}

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
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
    const token = localStorage.getItem('token');
    
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      return false;
    }
  };

  // Fetch user profile using the /auth/profile endpoint
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching user profile...');
      
      const response = await apiClient.get('/auth/profile');
      
      if (response.success) {
        setUserProfile(response.data as UserProfile);
        console.log('✅ User profile fetched successfully:', response.data);
        
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
      console.log('🔄 Logging out...');
      
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
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still clear local data even if logout call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUserProfile(null);
      setIsAuthenticated(false);
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
          console.log('✅ User profile loaded from localStorage');
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
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        {/* Logo */}
        <div className="px-4 py-6 border-b border-[#3d4f8f]">
          <h1 className="text-xl font-bold">AutoFleet Hub</h1>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
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
                {/* Debug: Show user role */}
                <div className="text-xs text-yellow-400 font-bold">
                  Role: {userProfile.role}
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
                <div className="text-xs text-blue-300 tracking-wide">USER</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition text-sm ${
                location.pathname.startsWith(item.to)
                  ? "bg-[#3d4f8f] text-white"
                  : "text-gray-300 hover:bg-[#3d4f8f]/50 hover:text-white"
              }`}
              onClick={() => navigate(item.to)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
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
        </div>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default SidebarLayout;
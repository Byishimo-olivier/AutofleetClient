import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { authService } from '@/services/authService';
import carImage from '@/assets/car-login.jpg';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: 'byron@gmail.com',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  // Role-based redirect function
  const redirectBasedOnRole = (user: any) => {
    const role = user?.role?.toLowerCase();
    
    const from = location.state?.from?.pathname;
    
    if (from && from !== '/login') {
      if (
        (role === 'admin' && from.startsWith('/admin')) ||
        (role === 'owner' && (from.startsWith('/dashboard') || from.startsWith('/vehicles') || from.startsWith('/booking') || from.startsWith('/feedback') || from.startsWith('/analytics') || from.startsWith('/profile'))) ||
        (role === 'customer' && (from.startsWith('/home') || from.startsWith('/MyBookings') || from.startsWith('/Vehicles') || from.startsWith('/Booking') || from.startsWith('/Support')))
      ) {
        navigate(from, { replace: true });
        return;
      }
    }

    switch (role) {
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'owner':
        navigate('/dashboard', { replace: true });
        break;
      case 'customer':
        navigate('/home', { replace: true });
        break;
      default:
        navigate('/dashboard', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        console.log('✅ Login successful, user role:', response.user?.role);
        redirectBasedOnRole(response.user);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'owner' | 'customer') => {
    setLoading(true);
    setError('');
    
    const demoCredentials = {
      admin: { email: 'admin@autofleet.com', password: 'admin123' },
      owner: { email: 'owner@autofleet.com', password: 'owner123' },
      customer: { email: 'byron@gmail.com', password: 'password123' }
    };

    try {
      const { email, password } = demoCredentials[type];
      setFormData(prev => ({ ...prev, email, password }));
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        console.log(`✅ Demo ${type} login successful`);
        redirectBasedOnRole(response.user);
      } else {
        setError(`Demo ${type} login failed`);
      }
    } catch (error: any) {
      setError(`Demo ${type} login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative">
        {/* Background overlay for left side */}
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
        
        <div className="relative z-10 w-full max-w-sm">
          {/* Title */}
          <h1 className="text-white text-xl font-light mb-8 text-center">
            AutoFleet Hub
          </h1>
          
          {/* Social Login Buttons */}
          <div className="flex space-x-3 mb-8">
            <button className="bg-white text-gray-800 px-4 py-2.5 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors flex-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-xs">Google</span>
            </button>
            
            <button className="bg-gray-800 text-white px-4 py-2.5 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors border border-gray-600 flex-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-xs">GitHub</span>
            </button>
          </div>
          
          {/* Login Form */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="byron@gmail.com"
                required
                disabled={loading}
              />
            </div>
            
            {/* Password */}
            <div>
              <label className="block text-white text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-gray-500 text-white pb-2 pr-10 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-0 bottom-2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-transparent"
              />
              <label htmlFor="terms" className="text-white text-sm">
                I accept the Terms & Condition
              </label>
            </div>
            
            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'SIGN IN'
              )}
            </button>
          </form>
          
          {/* Sign Up Link */}
          <p className="text-white text-sm text-center mt-8">
            If You don't Have An Account?{' '}
            <Link 
              to="/register" 
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right Side - Car Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <img
          src={carImage}
          alt="Car"
          className="object-cover w-full h-full"
          style={{ minHeight: '100vh' }}
        />
        <div className="absolute inset-0 bg-black opacity-60" />
      </div>
    </div>
  );
};

export default LoginPage;


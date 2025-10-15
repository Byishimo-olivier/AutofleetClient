import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingContxt';

// Replace with your actual car image path
import carImage from '@/assets/car-login.jpg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-black bg-opacity-90 px-8 py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
          </div>
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            Sign in to your account
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              create a new account
            </Link>
          </p>
          <Card className="bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Welcome back</CardTitle>
              <CardDescription className="text-gray-400">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label htmlFor="email" className="text-white">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-gray-900 text-white border-gray-700"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-gray-900 text-white border-gray-700"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a
                      href="#"
                      className="font-medium text-blue-400 hover:text-blue-300"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black text-gray-400">Demo Accounts</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm bg-gray-800 text-white border-gray-700"
                    onClick={() => {
                      setEmail('admin@autofleet.com');
                      setPassword('admin123');
                    }}
                  >
                    Demo Admin Account
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-sm bg-gray-800 text-white border-gray-700"
                    onClick={() => {
                      setEmail('customer@autofleet.com');
                      setPassword('customer123');
                    }}
                  >
                    Demo Customer Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Right: Car Image */}
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


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Eye, EyeOff, Loader2, User, Users } from 'lucide-react';
import carImage from '@/assets/car-login.jpg';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'owner'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create your account
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              sign in to your existing account
            </Link>
          </p>
          <Card className="bg-transparent shadow-none">
            <CardHeader>
              <CardTitle className="text-white">Join AutoFleet Hub</CardTitle>
              <CardDescription className="text-gray-400">
                Create your account to start renting or listing vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Account Type Selection */}
                <div>
                  <Label htmlFor="role" className="text-white">Account Type</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: string) => 
                      setFormData(prev => ({ ...prev, role: value as 'customer' | 'owner' }))
                    }
                  >
                    <SelectTrigger className="mt-1 bg-gray-900 text-white border-gray-700">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="bg-gray-900 text-white border-gray-700">
                        <SelectItem value="customer">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Customer - Rent vehicles</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="owner">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>Owner - List your vehicles</span>
                          </div>
                        </SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-900 text-white border-gray-700"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-900 text-white border-gray-700"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-white">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 bg-gray-900 text-white border-gray-700"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-white">Phone number (optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 bg-gray-900 text-white border-gray-700"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className="bg-gray-900 text-white border-gray-700"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">Confirm password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="bg-gray-900 text-white border-gray-700"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-900"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>
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

export default RegisterPage;


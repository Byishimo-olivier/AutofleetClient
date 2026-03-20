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

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState('basic');

  const plans = [
    { id: 'basic', name: 'Basic Plan', amount: 50000, description: 'Perfect for small fleets (up to 5 vehicles)' },
    { id: 'premium', name: 'Premium Plan', amount: 100000, description: 'For large fleets (unlimited vehicles)' }
  ];

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

    // Step 1 Validation
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (formData.role === 'owner') {
        setStep(2);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Step 1: Register User
      const response = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      // Step 2: If Owner, Create Subscription
      if (formData.role === 'owner') {
        try {
          // Note: We need to use the token from register response (AuthContext usually handles this)
          // We'll call the subscription endpoint using a clean URL structure
          const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
          const subResponse = await fetch(`${baseUrl}/api/subscriptions/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('autofleet_token')}`
            },
            body: JSON.stringify({
              planId: selectedPlan,
              phoneNumber: formData.phone || ''
            })
          });

          const subData = await subResponse.json();
          if (!subData.success) {
            throw new Error(subData.message || 'Subscription failed');
          }

          // Redirect to a summary/pending page or dashboard
          navigate('/dashboard');
        } catch (subErr: any) {
          console.error('Subscription error during signup:', subErr);
          // We registered but sub failed. Maybe just go to dashboard and ask for sub there?
          navigate('/dashboard'); 
        }
      } else {
        navigate('/dashboard');
      }
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
          <h2 className="text-center text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Create your account' : 'Choose your subscription'}
          </h2>
          <p className="text-center text-sm text-gray-400 mb-8">
            {step === 1 ? (
              <>
                Or{' '}
                <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                  sign in to your existing account
                </Link>
              </>
            ) : 'Owners require an active subscription to list vehicles'}
          </p>
          
          <Card className="bg-transparent shadow-none border-gray-800">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="bg-red-900 border-red-800 text-red-100">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {step === 1 ? (
                  <>
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
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-900 text-white border-gray-700"
                          placeholder="First"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-white">Last name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-900 text-white border-gray-700"
                          placeholder="Last"
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
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-900 text-white border-gray-700"
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-white">Phone number (Paypack Mobile Money)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required={formData.role === 'owner'}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-900 text-white border-gray-700"
                        placeholder="078XXXXXXX"
                      />
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-900 text-white border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-white">Confirm</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="mt-1 bg-gray-900 text-white border-gray-700"
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input id="terms" type="checkbox" required className="h-4 w-4 text-blue-600 rounded bg-gray-900 border-gray-700" />
                      <label htmlFor="terms" className="ml-2 text-xs text-gray-400">
                        I agree to the Terms and Privacy Policy
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedPlan === plan.id 
                          ? 'border-blue-500 bg-blue-900 bg-opacity-20' 
                          : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-white">{plan.name}</h3>
                          <span className="text-blue-400 font-bold">{plan.amount.toLocaleString()} RWF</span>
                        </div>
                        <p className="text-xs text-gray-400">{plan.description}</p>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      ← Back to details
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                  ) : (
                    step === 1 ? (formData.role === 'owner' ? 'Continue to Plans' : 'Create Account') : 'Pay & Complete'
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


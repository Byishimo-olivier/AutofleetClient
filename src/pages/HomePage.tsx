import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Car, 
  Users, 
  Shield, 
  Star, 
  Search, 
  Calendar,
  CreditCard,
  MapPin,
  BarChart3,
  Clock
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Easy Vehicle Search',
      description: 'Find the perfect vehicle with our advanced search and filtering system.'
    },
    {
      icon: Calendar,
      title: 'Simple Booking',
      description: 'Book vehicles instantly with our streamlined reservation process.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing with multiple payment options.'
    },
    {
      icon: MapPin,
      title: 'Real-time Tracking',
      description: 'Track vehicle location and availability in real-time.'
    },
    {
      icon: Star,
      title: 'Rating System',
      description: 'Rate and review vehicles to help other customers make informed decisions.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive analytics for vehicle owners and administrators.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Vehicles Available' },
    { number: '1000+', label: 'Happy Customers' },
    { number: '50+', label: 'Vehicle Owners' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to AutoFleet Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your trusted platform for car rental management. Connect with vehicle owners, 
              find the perfect ride, and manage your fleet with ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/vehicles')}
                    className="text-lg px-8 py-3"
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Browse Vehicles
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => navigate('/register')}
                    className="text-lg px-8 py-3"
                  >
                    Get Started
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/vehicles')}
                    className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Browse Vehicles
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AutoFleet Hub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive platform that makes car rental management 
              simple, secure, and efficient for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account as a customer or vehicle owner
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse & Book</h3>
              <p className="text-gray-600">
                Find the perfect vehicle and make your reservation
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Ride</h3>
              <p className="text-gray-600">
                Pick up your vehicle and enjoy your journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and vehicle owners
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-3"
              >
                <Users className="mr-2 h-5 w-5" />
                Join as Customer
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600"
              >
                <Car className="mr-2 h-5 w-5" />
                Become an Owner
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;


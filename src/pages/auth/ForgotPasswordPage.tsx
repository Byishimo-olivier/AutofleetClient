import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { authService } from '@/services/authService';
import carImage from '@/assets/car-login.jpg';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative">
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>
        <div className="relative z-10 w-full max-w-sm">
          <h1 className="text-white text-xl font-light mb-8 text-center">
            AutoFleet Hub
          </h1>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {sent ? (
            <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6 text-sm">
              If an account with that email exists, a reset link has been sent.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'SEND RESET LINK'
                )}
              </button>
            </form>
          )}

          <p className="text-white text-sm text-center mt-8">
            Remembered your password?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <img
          src={carImage}
          alt="AutoFleet"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

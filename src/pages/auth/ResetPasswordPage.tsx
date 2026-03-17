import React, { useMemo, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import { authService } from '@/services/authService';
import carImage from '@/assets/car-login.jpg';

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const { token: tokenParam } = useParams<{ token?: string }>();
  const token = useMemo(() => {
    return params.get('token') || tokenParam || '';
  }, [params, tokenParam]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
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

          {success ? (
            <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6 text-sm">
              Your password has been reset successfully.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-500 text-white pb-2 focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="Confirm new password"
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
                    Resetting...
                  </div>
                ) : (
                  'RESET PASSWORD'
                )}
              </button>
            </form>
          )}

          <p className="text-white text-sm text-center mt-8">
            Back to{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
              login
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

export default ResetPasswordPage;

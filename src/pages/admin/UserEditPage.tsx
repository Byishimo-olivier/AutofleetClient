import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingContxt';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'owner' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export default function UserEditPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { settings } = useSettings();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Partial<User>>({});

  // Fetch user data
  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${userId}`);

      if (response.success && response.data) {
        setUser(response.data);
        setFormData(response.data);
        setError('');
      } else {
        setError('Failed to load user');
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof User, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name?.trim() || !formData.last_name?.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (!formData.email?.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await apiClient.put(`/users/admin/${userId}`, {
        first_name: formData.first_name?.trim(),
        last_name: formData.last_name?.trim(),
        email: formData.email?.trim(),
        phone: formData.phone?.trim(),
        role: formData.role
      });

      if (response.success) {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${settings.darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <h1 className={`text-2xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit User
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="text-red-600 mt-0.5">
              <X className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* User ID Info (Read-only) */}
              <div className={`p-4 rounded-lg ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  User ID
                </p>
                <p className={`text-lg font-mono font-semibold ${settings.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {user?.id}
                </p>
              </div>

              {/* Name Section */}
              <div className="border-t pt-8" style={{ borderColor: settings.darkMode ? '#374151' : '#e5e7eb' }}>
                <h2 className={`text-lg font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="border-t pt-8" style={{ borderColor: settings.darkMode ? '#374151' : '#e5e7eb' }}>
                <h2 className={`text-lg font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }`}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="e.g., +250788123456"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="border-t pt-8" style={{ borderColor: settings.darkMode ? '#374151' : '#e5e7eb' }}>
                <h2 className={`text-lg font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Account Settings
                </h2>

                <div>
                  {/* Role */}
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role
                  </label>
                  <select
                    value={formData.role || 'customer'}
                    onChange={(e) => handleInputChange('role', e.target.value as any)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none ${
                      settings.darkMode
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    }`}
                  >
                    <option value="customer">Customer</option>
                    <option value="owner">Owner</option>
                    {currentUser?.role === 'admin' && <option value="admin">Admin</option>}
                  </select>
                </div>
              </div>

              {/* Timestamps (Read-only) */}
              {(user?.created_at || user?.updated_at) && (
                <div className="border-t pt-8" style={{ borderColor: settings.darkMode ? '#374151' : '#e5e7eb' }}>
                  <h2 className={`text-lg font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Metadata
                  </h2>

                  <div className="grid grid-cols-2 gap-6">
                    {user?.created_at && (
                      <div>
                        <p className={`text-sm font-medium mb-1 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Created
                        </p>
                        <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-700'}>
                          {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {user?.updated_at && (
                      <div>
                        <p className={`text-sm font-medium mb-1 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last Updated
                        </p>
                        <p className={settings.darkMode ? 'text-gray-400' : 'text-gray-700'}>
                          {new Date(user.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-8 flex gap-4 justify-end" style={{ borderColor: settings.darkMode ? '#374151' : '#e5e7eb' }}>
                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    settings.darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

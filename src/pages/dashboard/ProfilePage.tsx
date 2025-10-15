import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from '@/contexts/SettingContxt';
import SidebarLayout from '@/components/layout/SidebarLayout';
import {
  BarChart2,
  Car,
  ClipboardList,
  MessageCircle,
  Users,
  User,
  LogOut,
  Bell,
  Settings,
  Moon,
  Sun,
  Globe,
  MapPin,
  CreditCard,
  Shield,
  Smartphone,
  Volume2,
  VolumeX,
  Trash2,
  Download,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

// Define the AppSettings type according to your settings structure
type AppSettings = {
  darkMode: boolean;
  language: string;
  currency: string;
  timezone: string;
  units: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  bookingReminders: boolean;
  paymentAlerts: boolean;
  promotionalEmails: boolean;
  weeklyReports: boolean;
  soundEnabled: boolean;
  notificationSound: string;
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  profileVisibility: string;
  dataSharing: boolean;
  locationTracking: boolean;
  analyticsOptOut: boolean;
  // Add any other settings keys as needed
};

const ProfilePage: React.FC = () => {
  const { settings, updateSetting, t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Currency symbols and formatting
  const currencyConfig = {
    USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
    RWF: { symbol: '₣', code: 'RWF', name: 'Rwandan Franc' },
    EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
  };

  // Format price based on selected currency
  const formatPrice = (amount: number) => {
    const config = currencyConfig[settings.currency as keyof typeof currencyConfig] || currencyConfig.USD;
    return `${config.symbol}${amount.toLocaleString()}`;
  };

  // Fetch profile and settings on mount
  useEffect(() => {
    fetchProfile();
    fetchAppSettings();
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1f2937';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb';
    }
  }, [settings.darkMode]);

  // Apply language to document
  useEffect(() => {
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get<any>("/auth/profile");
      if (res.success && res.data) {
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppSettings = async () => {
    try {
      const res = await apiClient.get<any>("/users/settings");
      if (res.success && res.data) {
        // Update each setting individually if setSettings is not available
        Object.entries(res.data).forEach(([key, value]) => {
          updateSetting(key, value);
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Load from localStorage as fallback
      const savedSettings = localStorage.getItem("appSettings");
      if (savedSettings) {
        // Update each setting individually if setSettings is not available
        Object.entries(JSON.parse(savedSettings) as Partial<AppSettings>).forEach(([key, value]) => {
          updateSetting(key, value);
        });
      }
    }
  };

  // Update profile handler
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    const res = await apiClient.put("/auth/profile", {
      firstName,
      lastName,
      phone,
    });
    if (res.success) {
      setProfileMsg(t.saveChanges + " ✓");
    } else {
      setProfileMsg(res.message || "Failed to update profile.");
    }
  };

  // Change password handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    if (!password || !newPassword) {
      setPasswordMsg("Please enter both current and new password.");
      return;
    }
    const res = await apiClient.put("/users/change-password", {
      currentPassword: password,
      newPassword,
    });
    if (res.success) {
      setPasswordMsg("Password updated successfully.");
      setPassword("");
      setNewPassword("");
    } else {
      setPasswordMsg(res.message || "Failed to change password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const res = await apiClient.delete("/users/account");
        if (res.success) {
          alert("Account deleted successfully.");
          localStorage.clear();
          navigate("/");
        } else {
          alert(res.message || "Failed to delete account.");
        }
      } catch (error) {
        alert("Error deleting account. Please try again.");
      }
    }
  };

  const exportData = async () => {
    try {
      const res = await apiClient.get("/users/export-data");
      if (res.success) {
        // Create and download file
        const blob = new Blob(
          [JSON.stringify(res.data, null, 2)],
          { type: "application/json" }
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `autofleet-data-${new Date()
          .toISOString()
          .split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert("Error exporting data. Please try again.");
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? "bg-blue-600" : settings.darkMode ? "bg-gray-600" : "bg-gray-200"
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <SidebarLayout>
      <div className="p-12">
        <div className={`max-w-4xl mx-auto ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow`}>
          {/* Tabs */}
          <div className={`border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <nav className="flex space-x-8 px-6">
            {[
              {
                id: "profile",
                label: t.profile,
                icon: <User className="w-4 h-4" />
              },
              {
                id: "settings",
                label: t.settings,
                icon: <Settings className="w-4 h-4" />
              },
              {
                id: "security",
                label: t.security,
                icon: <Shield className="w-4 h-4" />
              },
              {
                id: "privacy",
                label: t.privacy,
                icon: <Globe className="w-4 h-4" />
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : `border-transparent ${settings.darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className={`text-center ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{t.profileInfo}</h2>

                    <div className="flex flex-col items-center mb-6">
                      <div className={`w-20 h-20 rounded-full ${settings.darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center mb-2`}>
                        <User className={`w-12 h-12 ${settings.darkMode ? 'text-gray-300' : 'text-gray-400'}`} />
                      </div>
                      <button className="text-blue-700 text-sm font-medium underline mb-2">
                        Update Profile Picture
                      </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleProfileUpdate}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.firstName}:</label>
                          <input
                            type="text"
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              settings.darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.lastName}:</label>
                          <input
                            type="text"
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              settings.darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.email}:</label>
                        <input
                          type="email"
                          className={`w-full border rounded-lg px-3 py-2 text-sm ${
                            settings.darkMode 
                              ? 'bg-gray-600 border-gray-600 text-gray-300' 
                              : 'bg-gray-50 border-gray-300 text-gray-600'
                          }`}
                          value={email}
                          disabled
                        />
                      </div>

                      <div>
                        <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.phone}:</label>
                        <input
                          type="text"
                          className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            settings.darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      {profileMsg && (
                        <div className="text-center text-sm text-green-600">
                          {profileMsg}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                        >
                          {t.saveChanges}
                        </button>
                      </div>
                    </form>

                    {/* Change Password Section */}
                    <div className={`border-t pt-6 ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{t.changePassword}</h3>
                      <form className="space-y-4" onSubmit={handlePasswordChange}>
                        <div>
                          <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.currentPassword}:
                          </label>
                          <input
                            type="password"
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              settings.darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={`block font-semibold mb-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.newPassword}:</label>
                          <input
                            type="password"
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              settings.darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        {passwordMsg && (
                          <div className="text-center text-sm text-green-600">
                            {passwordMsg}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700"
                          >
                            {t.changePassword}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* App Settings Tab */}
                {activeTab === "settings" && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{t.settings}</h2>

                    {/* Notification Settings */}
                    <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Bell className="w-5 h-5" />
                        {t.notifications}
                      </h3>
                      <div className="space-y-3">
                        <ToggleSwitch
                          checked={settings.emailNotifications}
                          onChange={(value) =>
                            updateSetting("emailNotifications", value)
                          }
                          label="Email Notifications"
                        />
                        <ToggleSwitch
                          checked={settings.pushNotifications}
                          onChange={(value) =>
                            updateSetting("pushNotifications", value)
                          }
                          label="Push Notifications"
                        />
                        <ToggleSwitch
                          checked={settings.smsNotifications}
                          onChange={(value) =>
                            updateSetting("smsNotifications", value)
                          }
                          label="SMS Notifications"
                        />
                        <ToggleSwitch
                          checked={settings.bookingReminders}
                          onChange={(value) =>
                            updateSetting("bookingReminders", value)
                          }
                          label="Booking Reminders"
                        />
                        <ToggleSwitch
                          checked={settings.paymentAlerts}
                          onChange={(value) =>
                            updateSetting("paymentAlerts", value)
                          }
                          label="Payment Alerts"
                        />
                        <ToggleSwitch
                          checked={settings.promotionalEmails}
                          onChange={(value) =>
                            updateSetting("promotionalEmails", value)
                          }
                          label="Promotional Emails"
                        />
                        <ToggleSwitch
                          checked={settings.weeklyReports}
                          onChange={(value) =>
                            updateSetting("weeklyReports", value)
                          }
                          label="Weekly Reports"
                        />
                      </div>
                    </div>

                    {/* App Preferences */}
                    <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Smartphone className="w-5 h-5" />
                        {t.appPreferences}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                          <span className={`text-sm font-medium flex items-center gap-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            {t.darkMode}
                          </span>
                          <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              settings.darkMode ? "bg-blue-600" : "bg-gray-200"
                            }`}
                            onClick={() => updateSetting('darkMode', !settings.darkMode)}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.darkMode ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.language}
                          </span>
                          <select
                            value={settings.language}
                            onChange={(e) => updateSetting("language", e.target.value)}
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                            <option value="rw">Kinyarwanda</option>
                            <option value="sw">Kiswahili</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.currency}
                          </span>
                          <select
                            value={settings.currency}
                            onChange={(e) => updateSetting("currency", e.target.value)}
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="RWF">RWF (₣) - Rwandan Franc</option>
                            <option value="EUR">EUR (€) - Euro</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.timezone}
                          </span>
                          <select
                            value={settings.timezone}
                            onChange={(e) => updateSetting("timezone", e.target.value)}
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="UTC">UTC</option>
                            <option value="Africa/Kigali">Kigali Time</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="Europe/London">London Time</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t.units}</span>
                          <select
                            value={settings.units}
                            onChange={(e) => updateSetting("units", e.target.value)}
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="metric">Metric (km, L)</option>
                            <option value="imperial">Imperial (miles, gal)</option>
                          </select>
                        </div>

                        {/* Currency Preview */}
                        <div className={`mt-4 p-3 rounded-lg ${settings.darkMode ? 'bg-gray-600' : 'bg-blue-50'} border ${settings.darkMode ? 'border-gray-500' : 'border-blue-200'}`}>
                          <div className={`text-sm ${settings.darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                            Preview: Sample price {formatPrice(150)} per day
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sound Settings */}
                    <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {settings.soundEnabled ? (
                          <Volume2 className="w-5 h-5" />
                        ) : (
                          <VolumeX className="w-5 h-5" />
                        )}
                        {t.soundSettings}
                      </h3>
                      <div className="space-y-3">
                        <ToggleSwitch
                          checked={settings.soundEnabled}
                          onChange={(value) => updateSetting("soundEnabled", value)}
                          label={t.enableSounds}
                        />
                        {settings.soundEnabled && (
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {t.notificationSound}
                            </span>
                            <select
                              value={settings.notificationSound}
                              onChange={(e) =>
                                updateSetting("notificationSound", e.target.value)
                              }
                              className={`border rounded px-3 py-1 text-sm ${
                                settings.darkMode 
                                  ? 'bg-gray-600 border-gray-500 text-white' 
                                  : 'bg-white border-gray-300 text-gray-900'
                              }`}
                            >
                              <option value="default">Default</option>
                              <option value="chime">Chime</option>
                              <option value="bell">Bell</option>
                              <option value="buzz">Buzz</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{t.security}</h2>

                    <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Shield className="w-5 h-5" />
                        {t.accountSecurity}
                      </h3>
                      <div className="space-y-4">
                        <ToggleSwitch
                          checked={settings.twoFactorAuth}
                          onChange={(value) => updateSetting("twoFactorAuth", value)}
                          label={t.twoFactorAuth}
                        />
                        <ToggleSwitch
                          checked={settings.loginAlerts}
                          onChange={(value) => updateSetting("loginAlerts", value)}
                          label={t.loginAlerts}
                        />

                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.sessionTimeout}
                          </span>
                          <select
                            value={settings.sessionTimeout}
                            onChange={(e) =>
                              updateSetting("sessionTimeout", parseInt(e.target.value))
                            }
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className={`${settings.darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} p-4 rounded-lg border`}>
                      <h3 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-red-300' : 'text-red-800'}`}>
                        {t.dangerZone}
                      </h3>
                      <div className="space-y-3">
                        <button
                          onClick={exportData}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Download className="w-4 h-4" />
                          {t.exportData}
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t.deleteAccount}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div className="space-y-6">
                    <h2 className={`text-xl font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{t.privacy}</h2>

                    <div className={`${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Globe className="w-5 h-5" />
                        {t.dataPrivacy}
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.profileVisibility}
                          </span>
                          <select
                            value={settings.profileVisibility}
                            onChange={(e) =>
                              updateSetting("profileVisibility", e.target.value)
                            }
                            className={`border rounded px-3 py-1 text-sm ${
                              settings.darkMode 
                                ? 'bg-gray-600 border-gray-500 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            <option value="private">Private</option>
                            <option value="public">Public</option>
                          </select>
                        </div>

                        <ToggleSwitch
                          checked={settings.dataSharing}
                          onChange={(value) => updateSetting("dataSharing", value)}
                          label={t.dataSharing}
                        />

                        <ToggleSwitch
                          checked={settings.locationTracking}
                          onChange={(value) => updateSetting("locationTracking", value)}
                          label={t.locationTracking}
                        />

                        <ToggleSwitch
                          checked={settings.analyticsOptOut}
                          onChange={(value) => updateSetting("analyticsOptOut", value)}
                          label={t.analyticsOptOut}
                        />
                      </div>
                    </div>

                    <div className={`${settings.darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} p-4 rounded-lg border`}>
                      <h3 className={`text-lg font-semibold mb-2 ${settings.darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                        {t.privacyInfo}
                      </h3>
                      <p className={`text-sm mb-3 ${settings.darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                        {t.privacyText}
                      </p>
                      <div className={`space-y-2 text-sm ${settings.darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        <button className="underline hover:no-underline">
                          View Privacy Policy
                        </button>
                        <br />
                        <button className="underline hover:no-underline">
                          View Terms of Service
                        </button>
                        <br />
                        <button className="underline hover:no-underline">
                          Cookie Policy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ProfilePage;
import React, { useEffect, useState } from "react";
import { apiClient } from "@/services/apiClient";
import { useSettings } from "@/contexts/SettingContxt";

interface ProfileData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { settings, updateSetting, t } = useSettings();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get<ProfileData>("/auth/profile");
        if (res.success && res.data) {
          setProfile(res.data as ProfileData);
          setFirstName(res.data.first_name || "");
          setLastName(res.data.last_name || "");
          setEmail(res.data.email || "");
          setPhone(res.data.phone || "");
        }
      } catch (err) {
        setProfileMsg("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const res = await apiClient.put("/auth/profile", {
        firstName,
        lastName,
        email,
        phone,
      });
      if (res.success) {
        setProfileMsg("Profile updated successfully");
      } else {
        setProfileMsg(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      setProfileMsg(err?.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    try {
      const res = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setPasswordMsg("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPasswordMsg(res.message || "Failed to update password");
      }
    } catch (err: any) {
      setPasswordMsg(err?.message || "Failed to update password");
    }
  };

  const card = settings.darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200";
  const page = settings.darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";

  if (loading) {
    return <div className={`min-h-screen ${page} p-6`}>Loading...</div>;
  }

  return (
    <div className={`min-h-screen ${page} p-6`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-sm text-gray-500">Manage your account and preferences</p>
        </div>

        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <button className="px-4 py-2 rounded bg-amber-600 text-white font-semibold">
              Save Profile
            </button>
            {profileMsg && <p className="text-sm mt-2">{profileMsg}</p>}
          </form>
        </div>

        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
            <button className="px-4 py-2 rounded bg-amber-600 text-white font-semibold">
              Update Password
            </button>
            {passwordMsg && <p className="text-sm mt-2">{passwordMsg}</p>}
          </form>
        </div>

        <div className={`border rounded-2xl p-6 ${card}`}>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm">{t.language}</span>
            <select
              value={settings.language}
              onChange={(e) => updateSetting("language", e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="rw">Kinyarwanda</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">{t.currency}</span>
            <select
              value="RWF"
              disabled
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="RWF">RWF - Rwandan Franc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

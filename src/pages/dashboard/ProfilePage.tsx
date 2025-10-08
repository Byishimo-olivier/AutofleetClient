import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  Car,
  ClipboardList,
  MessageCircle,
  Users,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [emailNotif, setEmailNotif] = useState(true);
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    apiClient.get<any>("/auth/profile").then((res) => {
      if (res.success && res.data) {
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      }
      setLoading(false);
    });
  }, []);

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
      setProfileMsg("Profile updated successfully.");
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        <div className="px-4 py-6 border-b border-[#3d4f8f]">
          <h1 className="text-xl font-bold">AutoFleet Hub</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3d4f8f]">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {firstName} {lastName}
            </div>
            <div className="text-xs text-blue-300 tracking-wide">PROFILE</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarNavItem
            icon={<BarChart2 className="w-5 h-5" />}
            label="Dashboard"
            to="/dashboard"
            active={location.pathname.startsWith("/dashboard")}
          />
          <SidebarNavItem
            icon={<Car className="w-5 h-5" />}
            label="Vehicles"
            to="/vehicles"
            active={location.pathname.startsWith("/vehicles")}
          />
          <SidebarNavItem
            icon={<ClipboardList className="w-5 h-5" />}
            label="Bookings"
            to="/bookings"
            active={location.pathname.startsWith("/bookings")}
          />
          <SidebarNavItem
            icon={<MessageCircle className="w-5 h-5" />}
            label="Feedback"
            to="/feedback"
            active={location.pathname.startsWith("/feedback")}
          />
          <SidebarNavItem
            icon={<Users className="w-5 h-5" />}
            label="Analytics"
            to="/analytics"
            active={location.pathname.startsWith("/analytics")}
          />
          <SidebarNavItem
            icon={<User className="w-5 h-5" />}
            label="Profile & Account"
            to="/profile"
            active={location.pathname.startsWith("/profile")}
          />
        </nav>
        <div className="p-3">
          <button className="w-full flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white py-2.5 rounded-lg transition font-medium text-sm shadow-md">
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
          <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <a
                  href="#"
                  className="text-blue-700 text-sm font-medium underline mb-2"
                >
                  Update Profile Picture
                </a>
              </div>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div>
                  <label className="block font-semibold mb-1">First Name:</label>
                  <input
                    type="text"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Last Name:</label>
                  <input
                    type="text"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email:</label>
                  <input
                    type="email"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    value={email}
                    disabled
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone:</label>
                  <input
                    type="text"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="mt-8">
                  <div className="font-semibold mb-2">System Setting:</div>
                  <div className="flex items-center gap-4">
                    <Bell className="w-5 h-5 text-black" />
                    <span className="font-medium text-black">
                      Email Notification
                    </span>
                    <button
                      type="button"
                      className={`ml-4 w-12 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        emailNotif ? "bg-[#2c3e7d]" : "bg-gray-300"
                      }`}
                      onClick={() => setEmailNotif(!emailNotif)}
                    >
                      <span
                        className={`inline-block w-5 h-5 transform bg-white rounded-full shadow transition-transform duration-200 ${
                          emailNotif ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                {profileMsg && (
                  <div className="text-center text-sm text-green-600">
                    {profileMsg}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-[#2c3e7d] text-white font-semibold shadow hover:bg-[#1e295c]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              <form
                className="space-y-4 mt-10"
                onSubmit={handlePasswordChange}
              >
                <div className="font-semibold mb-2">Change Password</div>
                <div>
                  <label className="block font-semibold mb-1">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">New Password:</label>
                  <input
                    type="password"
                    className="w-full border border-blue-200 rounded px-3 py-2 text-sm"
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
                    className="px-6 py-2 rounded bg-[#2c3e7d] text-white font-semibold shadow hover:bg-[#1e295c]"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Sidebar nav item with navigation
function SidebarNavItem({
  icon,
  label,
  to,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition text-sm ${
        active ? "bg-[#3d4f8f]" : "hover:bg-[#3d4f8f]/50"
      }`}
      onClick={() => navigate(to)}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </div>
  );
}

export default ProfilePage;
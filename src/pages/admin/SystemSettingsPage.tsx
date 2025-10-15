import React, { useState } from "react";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  FileText,
  Settings,
  Bell,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCcw,
  Mail,
  Smartphone,
  Zap,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useSettings } from '@/contexts/SettingContxt';

const adminNav = [
  { icon: <BarChart2 className="w-5 h-5" />, label: "Dashboard", to: "/admin" },
  { icon: <Users className="w-5 h-5" />, label: "User Management", to: "/admin/users" },
  { icon: <Car className="w-5 h-5" />, label: "Vehicle Management", to: "/admin/vehicles" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings Management", to: "/admin/bookings" },
  { icon: <PieChart className="w-5 h-5" />, label: "Reports & Analytics", to: "/admin/reports" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Disputes & Support", to: "/admin/disputes" },
  { icon: <Sliders className="w-5 h-5" />, label: "System Settings", to: "/admin/settings" },
  { icon: <AlertCircle className="w-5 h-5" />, label: "Notifications Center", to: "/admin/notifications" },
  { icon: <User className="w-5 h-5" />, label: "Profile & Account", to: "/profile" },
];

const notificationTemplates = [
  {
    type: "Email",
    icon: <Mail className="w-4 h-4 text-blue-600" />,
    name: "Booking Confirmation",
    date: "Jan 15, 2025",
  },
  {
    type: "SMS",
    icon: <Smartphone className="w-4 h-4 text-green-600" />,
    name: "Payment Success",
    date: "Jan 14, 2025",
  },
  {
    type: "Push",
    icon: <Zap className="w-4 h-4 text-purple-600" />,
    name: "Dispute Alert",
    date: "Jan 13, 2025",
  },
];

const commissionImpactData = [
  { commission: "5%", revenue: 50, retention: 90 },
  { commission: "7.5%", revenue: 60, retention: 85 },
  { commission: "10%", revenue: 70, retention: 80 },
  { commission: "12.5%", revenue: 80, retention: 75 },
  { commission: "15%", revenue: 90, retention: 70 },
  { commission: "17.5%", revenue: 95, retention: 65 },
  { commission: "20%", revenue: 100, retention: 60 },
];

const SystemSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [commission, setCommission] = useState(10);
  const [dynamicPricing, setDynamicPricing] = useState(true);
  const [lateFee, setLateFee] = useState(25);
  const [cancelFee, setCancelFee] = useState(15);
  const { settings, formatPrice, t } = useSettings();

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        <div className="px-4 py-6 border-b border-[#3d4f8f]">
          <h1 className="text-xl font-bold">AutoFleet Hub</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3d4f8f]">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-200">Admin</span>
            <span className="text-xs text-gray-400">admin@example.com</span>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4">
          {adminNav.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer
              ${location.pathname === item.to ? "bg-[#3d4f8f] text-white" : "text-gray-300 hover:bg-[#3d4f8f] hover:text-white"}
              `}
              onClick={() => navigate(item.to)}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="p-3">
          <button className="w-full flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white py-2.5 rounded-lg transition font-medium text-sm shadow-md">
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8 flex gap-6">
        {/* Left Main Settings */}
        <div className="flex-1 space-y-8">
          {/* Payment Options */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" /> Payment Options
              </div>
              <button className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded font-semibold shadow">
                <PlusCircle className="w-5 h-5" /> Add Payment Method
              </button>
            </div>
            <div className="flex gap-6">
              <div className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col items-start border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-lg">Mobile Money</span>
                  <button className="ml-2">
                    <ToggleRight className="w-7 h-7 text-green-500" />
                  </button>
                </div>
                <span className="text-xs text-green-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Active - 2.5% fee
                </span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col items-start border-2 border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-lg">Bank Transfer</span>
                  <button className="ml-2">
                    <ToggleRight className="w-7 h-7 text-green-500" />
                  </button>
                </div>
                <span className="text-xs text-green-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Active - No fee
                </span>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col items-start border-2 border-gray-200 opacity-60">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="font-semibold text-lg text-gray-400">Credit/Debit Card</span>
                  <button className="ml-2">
                    <ToggleLeft className="w-7 h-7 text-gray-400" />
                  </button>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Pending Integration
                </span>
              </div>
            </div>
          </div>

          {/* Notification Templates */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notification Templates
              </div>
              <button className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded font-semibold shadow">
                <PlusCircle className="w-5 h-5" /> Create New Template
              </button>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Template Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Last Updated</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notificationTemplates.map((t, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-gray-100`}>
                          {t.icon} {t.type}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{t.name}</td>
                    <td className="px-4 py-3">{t.date}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="text-blue-700 hover:underline flex items-center gap-1">
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                      <button className="text-gray-700 hover:underline flex items-center gap-1">
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button className="text-red-700 hover:underline flex items-center gap-1">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing & Commission Rules */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-semibold text-lg flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" /> Pricing & Commission Rules
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Base Commission %</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2 text-sm mb-4"
                  value={commission}
                  onChange={e => setCommission(Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-semibold">Dynamic Pricing</span>
                  <span className="text-xs text-gray-500">Adjust prices based on demand</span>
                  <button
                    type="button"
                    className={`ml-2 w-12 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
                      dynamicPricing ? "bg-[#2c3e7d]" : "bg-gray-300"
                    }`}
                    onClick={() => setDynamicPricing(!dynamicPricing)}
                  >
                    <span
                      className={`inline-block w-5 h-5 transform bg-white rounded-full shadow transition-transform duration-200 ${
                        dynamicPricing ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="font-semibold">Late Return Fee</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-sm"
                    value={lateFee}
                    onChange={e => setLateFee(Number(e.target.value))}
                  />
                  <span className="text-gray-500">$</span>
                  <label className="font-semibold ml-6">Cancellation Fee</label>
                  <input
                    type="number"
                    className="w-20 border rounded px-2 py-1 text-sm"
                    value={cancelFee}
                    onChange={e => setCancelFee(Number(e.target.value))}
                  />
                  <span className="text-gray-500">$</span>
                </div>
                <button className="bg-[#1746a2] hover:bg-[#12367a] text-white px-6 py-2 rounded font-semibold shadow">
                  Save Pricing Settings
                </button>
              </div>
              <div>
                <div className="font-semibold mb-2">Commission Impact Preview</div>
                <div className="h-40 bg-gray-50 rounded">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={commissionImpactData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="commission" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="Monthly Revenue (5K)" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="retention" name="Owner Retention (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold mb-2">Quick Actions</div>
            <button className="w-full flex items-center gap-2 justify-center border border-red-300 text-red-700 px-4 py-2 rounded mb-2 font-semibold hover:bg-red-50">
              <RefreshCcw className="w-4 h-4" /> Restore Default Settings
            </button>
            <button className="w-full flex items-center gap-2 justify-center border border-gray-300 text-gray-700 px-4 py-2 rounded mb-2 font-semibold hover:bg-gray-50">
              <Download className="w-4 h-4" /> Export Settings
            </button>
            <button className="w-full flex items-center gap-2 justify-center border border-blue-300 text-blue-700 px-4 py-2 rounded font-semibold hover:bg-blue-50">
              <RefreshCcw className="w-4 h-4" /> Sync with Backup
            </button>
          </div>
          {/* System Status */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold mb-2">System Status</div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>Database</span>
                <span className="ml-auto text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Payment Gateway</span>
                <span className="ml-auto text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>SMS Service</span>
                <span className="ml-auto text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Warning
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Last Backup</span>
                <span className="ml-auto text-gray-600">2 hours ago</span>
              </div>
            </div>
          </div>
          {/* Recent Changes */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="font-semibold mb-2">Recent Changes</div>
            <ul className="text-sm space-y-2">
              <li>
                <span className="text-blue-700 font-semibold">Payment method updated</span>
                <span className="block text-xs text-gray-500">2 hours ago</span>
              </li>
              <li>
                <span className="text-green-700 font-semibold">New template created</span>
                <span className="block text-xs text-gray-500">1 day ago</span>
              </li>
              <li>
                <span className="text-orange-700 font-semibold">Commission rate changed</span>
                <span className="block text-xs text-gray-500">3 days ago</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
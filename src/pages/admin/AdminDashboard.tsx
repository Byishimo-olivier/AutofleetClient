import React from "react";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  Plus,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const stats = [
  {
    label: "Total Bookings",
    value: "1,245",
    icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
    change: "+12% this month",
    changeColor: "text-green-600",
    badge: (
      <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10m-12 8V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"
          />
        </svg>
        17
      </span>
    ),
  },
  {
    label: "Total Revenue",
    value: "$54,320",
    icon: <FileText className="w-6 h-6 text-green-600" />,
    change: "+8% this month",
    changeColor: "text-green-600",
  },
  {
    label: "Active Vehicles",
    value: "342",
    icon: <Car className="w-6 h-6 text-yellow-500" />,
    change: "78% utilization",
    changeColor: "text-blue-600",
  },
  {
    label: "Active Users",
    value: "1,830",
    icon: <Users className="w-6 h-6 text-blue-500" />,
    change: "+250 new users",
    changeColor: "text-green-600",
  },
];

const quickActions = [
  {
    label: "Add Vehicle",
    icon: <Plus className="w-7 h-7 text-green-600" />,
    border: "border-green-200",
  },
  {
    label: "Add User",
    icon: <UserPlus className="w-7 h-7 text-blue-600" />,
    border: "border-blue-200",
  },
  {
    label: "Generate Report",
    icon: <FileText className="w-7 h-7 text-green-700" />,
    border: "border-green-200",
  },
  {
    label: "Settings",
    icon: <Settings className="w-7 h-7 text-blue-700" />,
    border: "border-blue-200",
  },
];

const trendsData = [
  { month: "Jan", bookings: 60, revenue: 30 },
  { month: "Feb", bookings: 70, revenue: 32 },
  { month: "Mar", bookings: 80, revenue: 35 },
  { month: "Apr", bookings: 95, revenue: 40 },
  { month: "May", bookings: 110, revenue: 45 },
  { month: "Jun", bookings: 125, revenue: 50 },
  { month: "Jul", bookings: 140, revenue: 55 },
  { month: "Aug", bookings: 160, revenue: 60 },
];

const topRented = [
  { name: "Toyota RAV4", color: "bg-red-200 text-red-700", bookings: 104 },
  { name: "Honda Civic", color: "bg-blue-200 text-blue-700", bookings: 78 },
  { name: "BMW X5", color: "bg-green-200 text-green-700", bookings: 58 },
  { name: "Tesla Model 3", color: "bg-yellow-200 text-yellow-700", bookings: 26 },
  { name: "Audi A4", color: "bg-purple-200 text-purple-700", bookings: 20 },
];

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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
      <div className="flex-1 p-8">
        {/* Top search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search ..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring w-80 bg-white shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
              EN <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
              <div className="bg-gray-100 rounded-full p-3">{stat.icon}</div>
              <div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-2xl font-bold flex items-center">
                  {stat.value}
                  {stat.badge}
                </div>
                <div className={`text-xs ${stat.changeColor}`}>{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="font-semibold mb-2 text-gray-700">Quick Actions</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className={`flex flex-col items-center justify-center bg-white border-2 ${action.border} rounded-lg py-6 shadow hover:bg-gray-50 transition`}
              >
                {action.icon}
                <span className="mt-3 font-semibold text-base">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trends & Top Rented */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bookings & Revenue Trends */}
          <div className="col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="font-semibold mb-3 text-gray-700 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
              Bookings & Revenue Trends
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#4c5fa3"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Bookings"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Top 5 Rented Vehicles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="font-semibold mb-3 text-gray-700">Top 5 Rented Vehicles</div>
            <ul className="space-y-3">
              {topRented.map((v, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${v.color} inline-block`} />
                  <span className="flex-1">{v.name}</span>
                  <span className="font-semibold">{v.bookings} bookings</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


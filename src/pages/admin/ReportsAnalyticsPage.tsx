import React from "react";
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
  Download,
  Star,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

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

const stats = [
  {
    label: "Total Rentals",
    value: "12,450",
    icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
    change: "+10% from last month",
    changeColor: "text-green-600",
  },
  {
    label: "Total Revenue",
    value: "$1.2M",
    icon: <FileText className="w-6 h-6 text-green-600" />,
    change: "+15% from last month",
    changeColor: "text-green-600",
  },
  {
    label: "Fleet Utilization",
    value: "82%",
    icon: <BarChart2 className="w-6 h-6 text-red-500" />,
    change: "-5% from last month",
    changeColor: "text-red-600",
  },
  {
    label: "Average Rating",
    value: 4.6,
    icon: <Star className="w-6 h-6 text-blue-500" />,
    change: "+250 new users",
    changeColor: "text-green-600",
  },
];

const rentalTrendsData = [
  { day: "Mon", rentals: 120 },
  { day: "Tue", rentals: 160 },
  { day: "Wed", rentals: 200 },
  { day: "Thu", rentals: 240 },
  { day: "Fri", rentals: 280 },
  { day: "Sat", rentals: 320 },
  { day: "Sun", rentals: 290 },
];

const fleetUtilizationData = [
  { name: "Sedan", value: 75, color: "#2563eb" },
  { name: "SUV", value: 90, color: "#22c55e" },
  { name: "Van", value: 85, color: "#eab308" },
  { name: "Truck", value: 65, color: "#6b7280" },
];

const revenueByCategoryData = [
  { name: "Sedan", revenue: 500 },
  { name: "SUV", revenue: 900 },
  { name: "Van", revenue: 350 },
  { name: "Truck", revenue: 300 },
];

const paymentMethodsData = [
  { name: "Card", value: 40, color: "#2563eb" },
  { name: "Mobile Money", value: 45, color: "#22c55e" },
  { name: "Cash", value: 15, color: "#eab308" },
];

const ReportsAnalyticsPage: React.FC = () => {
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
        {/* Top search/filter/export */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>All Owners</option>
            <option>Owner 1</option>
            <option>Owner 2</option>
          </select>
          <button className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-6 py-2 rounded font-semibold shadow ml-auto">
            <Download className="w-5 h-5" /> Export
          </button>
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
                </div>
                <div className={`text-xs ${stat.changeColor}`}>{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Rental Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-700">Rental Trends</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Daily</button>
                <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">Weekly</button>
                <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">Monthly</button>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rentalTrendsData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rentals" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Fleet Utilization Donut */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="font-semibold text-gray-700 mb-2">Fleet Utilization</div>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Replace with <PieChart ... /> from recharts */}
              <RePieChart width={400} height={400}>
                <Pie
                  data={fleetUtilizationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {fleetUtilizationData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              {fleetUtilizationData.map((item) => (
                <span key={item.name} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} {item.value}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue by Category & Payment Donut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="font-semibold text-gray-700 mb-2">Revenue ($)</div>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Replace with <BarChart ... /> from recharts */}
              <BarChart
                width={500}
                height={300}
                data={revenueByCategoryData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </div>
          </div>
          {/* Payment Methods Donut */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="font-semibold text-gray-700 mb-2">Payment Methods</div>
            <div className="h-48 flex items-center justify-center text-gray-400">
              {/* Replace with <PieChart ... /> from recharts */}
              <RePieChart width={400} height={400}>
                <Pie
                  data={paymentMethodsData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {paymentMethodsData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RePieChart>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              {paymentMethodsData.map((item) => (
                <span key={item.name} className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
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
  Eye,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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

// Example data
const disputes = [
  {
    id: "DSP-1034",
    bookingId: "#BK-2458",
    customer: { initials: "JK", name: "John kamali" },
    owner: "Premium Cars Ltd",
    issue: "Late delivery of vehicle",
    status: "Open",
    priority: "High",
    actions: ["View", "Close"],
  },
  {
    id: "DSP-1034",
    bookingId: "#BK-2458",
    customer: { initials: "PK", name: "Prince Kyz" },
    owner: "City Rentals",
    issue: "Vehicle condition issues",
    status: "In progress",
    priority: "Medium",
    actions: ["View", "Close"],
  },
  {
    id: "DSP-1034",
    bookingId: "#BK-2458",
    customer: { initials: "UT", name: "Uwineza Theo" },
    owner: "Express Vehicles",
    issue: "Billing discrepancy",
    status: "Resolved",
    priority: "Low",
    actions: ["View", "Close"],
  },
];

const tickets = [
  {
    id: "TKT-4552",
    user: { initials: "JK", name: "John kamali" },
    subject: "Payment not reflecting",
    category: "Payment",
    status: "Open",
    actions: ["View", "Close"],
  },
  {
    id: "TKT-4552",
    user: { initials: "UT", name: "Uwineza Theo" },
    subject: "Account verification issue",
    category: "Account",
    status: "In Progress",
    actions: ["View", "Close"],
  },
];

const statusColor: Record<string, string> = {
  Open: "bg-orange-100 text-orange-700",
  "In progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
};
const priorityColor: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};
const categoryColor: Record<string, string> = {
  Payment: "bg-blue-700 text-white",
  Account: "bg-purple-700 text-white",
};

const ticketStatusColor: Record<string, string> = {
  Open: "bg-orange-100 text-orange-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Resolved: "bg-green-100 text-green-700",
};

const DisputesSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"disputes" | "tickets">("disputes");

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
        {/* Top filters and create button */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>Date Range</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <button className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-6 py-2 rounded font-semibold shadow ml-auto">
            <PlusCircle className="w-5 h-5" /> Create Support Ticket
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-4">
          <button
            className={`pb-1 font-semibold border-b-2 ${
              tab === "disputes"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setTab("disputes")}
          >
            Complaints / Disputes
          </button>
          <button
            className={`pb-1 font-semibold border-b-2 ${
              tab === "tickets"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setTab("tickets")}
          >
            Support Tickets
          </button>
        </div>

        {/* Tab Content */}
        {tab === "disputes" ? (
          <div className="bg-white rounded-xl shadow p-0 border border-gray-300">
            <div className="font-semibold px-6 py-3 border-b text-gray-700">Active Disputes</div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Dispute ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Booking ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner/Agency</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Issue Summary</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((d, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-semibold">{d.id}</td>
                    <td className="px-4 py-3">{d.bookingId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                          {d.customer.initials}
                        </span>
                        <span>{d.customer.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{d.owner}</td>
                    <td className="px-4 py-3">{d.issue}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColor[d.status]}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${priorityColor[d.priority]}`}>
                        {d.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="bg-gray-100 hover:bg-blue-100 text-blue-700 p-2 rounded flex items-center gap-1 text-xs">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button className="bg-gray-100 hover:bg-red-100 text-red-700 p-2 rounded flex items-center gap-1 text-xs">
                        <X className="w-4 h-4" /> Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-0 border border-gray-300">
            <div className="font-semibold px-6 py-3 border-b text-gray-700">Support Tickets</div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ticket ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3 font-semibold">{t.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                          {t.user.initials}
                        </span>
                        <span>{t.user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${categoryColor[t.category]}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${ticketStatusColor[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="bg-gray-100 hover:bg-blue-100 text-blue-700 p-2 rounded flex items-center gap-1 text-xs">
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button className="bg-gray-100 hover:bg-red-100 text-red-700 p-2 rounded flex items-center gap-1 text-xs">
                        <X className="w-4 h-4" /> Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputesSupportPage;
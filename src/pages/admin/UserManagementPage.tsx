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
  UserPlus,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  Edit,
  Trash2,
  Search,
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

const users = [
  {
    name: "KAYITARE Sabine",
    email: "sabine@gmail.com",
    phone: "250785206973",
    role: "Rental Agency",
    status: "Active",
  },
  {
    name: "Muhinda Kevin",
    email: "kevin@gmail.com",
    phone: "250785206973",
    role: "Admin",
    status: "Active",
  },
  {
    name: "Kalindi Joseph",
    email: "joseph@gmail.com",
    phone: "250785206973",
    role: "Customer",
    status: "Active",
  },
  {
    name: "Ishimwe Asifie",
    email: "Asifie@gmail.com",
    phone: "250785206973",
    role: "Customer",
    status: "Inactive",
  },
];

const UserManagementPage: React.FC = () => {
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

        {/* User Management Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg text-gray-700">User Management</div>
          <button className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-5 py-2 rounded font-semibold shadow">
            <UserPlus className="w-5 h-5" /> Add New User
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center border rounded px-2 py-1 bg-white w-72">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search User By name"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <select className="border rounded px-3 py-2 text-sm bg-white w-72">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Rental Agency</option>
            <option>Customer</option>
          </select>
          <button className="bg-[#1746a2] hover:bg-[#12367a] text-white px-8 py-2 rounded font-semibold shadow">
            Apply
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow p-0 border-2 border-blue-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Role</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-6 py-3 font-medium">{u.name}</td>
                  <td className="px-6 py-3">
                    <a href={`mailto:${u.email}`} className="text-blue-700 underline">{u.email}</a>
                  </td>
                  <td className="px-6 py-3">{u.phone}</td>
                  <td className="px-6 py-3">{u.role}</td>
                  <td className="px-6 py-3">
                    <span className={`px-4 py-1 rounded text-xs font-semibold ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <button className="bg-gray-100 hover:bg-blue-100 text-blue-700 p-2 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="bg-gray-100 hover:bg-red-100 text-red-700 p-2 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex items-center justify-end gap-1 px-6 py-3 bg-white border-t">
            <button className="px-2 py-1 rounded hover:bg-gray-100">&lt;</button>
            <button className="px-2 py-1 rounded bg-blue-800 text-white">1</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100">2</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-2 py-1 rounded hover:bg-gray-100">40</button>
            <button className="px-2 py-1 rounded hover:bg-gray-100">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
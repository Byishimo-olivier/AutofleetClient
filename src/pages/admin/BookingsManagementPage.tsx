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
  Edit,
  Trash2,
  Search,
  Download,
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

const bookings = [
  {
    id: "#BK1245",
    customer: "nkuranga james",
    customerEmail: "james@gmail.com",
    vehicle: "Toyota RAV4 2021",
    plate: "RAC 250G",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Completed",
    dateRange: "Aug 20 → Aug 25",
    days: 5,
    amount: "$450",
    payment: "Paid",
  },
  {
    id: "#BK1245",
    customer: "ntore Fred",
    customerEmail: "fred@gmail.com",
    vehicle: "Honda Civic 2022",
    plate: "RAD 789I",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Pending",
    dateRange: "Aug 20 → Aug 25",
    days: 5,
    amount: "$450",
    payment: "Paid",
  },
  {
    id: "#BK1245",
    customer: "Matata Abdu",
    customerEmail: "matata@gmail.com",
    vehicle: "BMW X5 2020",
    plate: "RAF 009A",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Disputed",
    dateRange: "Aug 20 → Aug 25",
    days: 5,
    amount: "$450",
    payment: "Paid",
  },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Disputed: "bg-red-100 text-red-700",
};

const BookingsManagementPage: React.FC = () => {
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
          <div className="flex items-center border rounded px-2 py-1 bg-white w-80">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search User By name"
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>All Status</option>
            <option>Completed</option>
            <option>Pending</option>
            <option>Disputed</option>
          </select>
          <button className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-6 py-2 rounded font-semibold shadow ml-auto">
            <Download className="w-5 h-5" /> Export
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-2">
          <button className="border-b-2 border-blue-700 pb-1 font-semibold text-blue-700 flex items-center gap-1">
            All bookings <span className="ml-1 bg-gray-200 text-xs px-2 rounded-full">3</span>
          </button>
          <button className="text-gray-500 hover:text-blue-700 flex items-center gap-1">
            Pending Approval <span className="ml-1 bg-yellow-400 text-white text-xs px-2 rounded-full">!</span>
          </button>
          <button className="text-gray-500 hover:text-blue-700 flex items-center gap-1">
            Completed Rentals <span className="ml-1 bg-green-500 text-white text-xs px-2 rounded-full">!</span>
          </button>
          <button className="text-gray-500 hover:text-blue-700 flex items-center gap-1">
            Canceled / Disputed <span className="ml-1 bg-red-500 text-white text-xs px-2 rounded-full">!</span>
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow p-0 mt-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">BOOKING ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">CUSTOMER</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">VEHICLE</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">OWNER/AGENCY</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">STATUS</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">DATE RANGE</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">PAYMENT</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-semibold">{b.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.customer}</div>
                    <div className="text-xs text-gray-500">{b.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.vehicle}</div>
                    <div className="text-xs text-gray-500">{b.plate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.owner}</div>
                    <div className="text-xs text-gray-500">{b.ownerEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-4 py-1 rounded text-xs font-semibold ${statusColor[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>{b.dateRange}</div>
                    <div className="text-xs text-gray-500">{b.days} days</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{b.amount}</div>
                    <div className="text-xs text-green-700">{b.payment}</div>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default BookingsManagementPage;
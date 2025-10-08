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
  PlusCircle,
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

type StatusType = "Approved" | "Pending" | "Removed";

interface Vehicle {
  image: string;
  name: string;
  plate: string;
  category: string;
  owner: string;
  ownerEmail: string;
  status: StatusType;
  availability: StatusType;
}

const vehicles: Vehicle[] = [
  {
    image: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg",
    name: "Toyota RAV4 2021",
    plate: "RAC 2500",
    category: "SUV",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Approved",
    availability: "Approved",
  },
  {
    image: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg",
    name: "Honda Civic 2022",
    plate: "RAD 789I",
    category: "Sedan",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Pending",
    availability: "Approved",
  },
  {
    image: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg",
    name: "BMW X5 2020",
    plate: "RAF 009A",
    category: "SUV",
    owner: "jean kalisa",
    ownerEmail: "jean@gmail.com",
    status: "Removed",
    availability: "Approved",
  },
];

const statusColor: Record<StatusType, string> = {
  Approved: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Removed: "bg-red-100 text-red-700",
};

const availColor: Record<StatusType, string> = {
  Approved: "bg-blue-100 text-blue-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Removed: "bg-red-100 text-red-700",
};

const VehicleManagementPage: React.FC = () => {
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

        {/* Filters and Add Button */}
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
            <option>All Categories</option>
            <option>SUV</option>
            <option>Sedan</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm bg-white">
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Removed</option>
          </select>
          <button className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded font-semibold shadow ml-auto">
            <PlusCircle className="w-5 h-5" /> Add New Vehicle
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-2">
          <button className="border-b-2 border-blue-700 pb-1 font-semibold text-blue-700">All Vehicles</button>
          <button className="text-gray-500 hover:text-blue-700">Pending Approval</button>
          <button className="text-gray-500 hover:text-blue-700">Categories</button>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-xl shadow p-0 mt-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">VEHICLE</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">CATEGORY</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">OWNER</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">STATUS</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">AVAILABILITY</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="px-6 py-3 flex items-center gap-3">
                    <img src={v.image} alt={v.name} className="w-12 h-10 rounded object-cover border" />
                    <div>
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.plate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-bold">{v.category}</td>
                  <td className="px-6 py-3">
                    <div className="font-semibold">{v.owner}</div>
                    <div className="text-xs text-gray-500">{v.ownerEmail}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-4 py-1 rounded text-xs font-semibold ${statusColor[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-4 py-1 rounded text-xs font-semibold ${availColor[v.availability]}`}>
                      {v.availability}
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
        </div>
      </div>
    </div>
  );
};

export default VehicleManagementPage;
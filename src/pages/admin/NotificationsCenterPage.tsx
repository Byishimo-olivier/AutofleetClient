import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingContxt";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  FileText,
  Settings as SettingsIcon,
  Bell,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  PlusCircle,
  CheckCircle,
  XCircle,
  Megaphone,
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

const bookingAlerts = [
  {
    type: "success",
    title: "Booking #1456 confirmed",
    desc: "Customer John Doe booked Toyota Corolla",
    time: "2 min ago",
    checked: true,
  },
  {
    type: "error",
    title: "Booking #1452 cancelled",
    desc: "Owner cancelled request",
    time: "10 mins ago",
    checked: true,
  },
];

const announcements = [
  {
    type: "maintenance",
    title: "System Maintenance Scheduled",
    desc: "Aug 20, 2:00–4:00 AM",
    time: "Posted 1 hour ago",
    color: "bg-yellow-100",
  },
  {
    type: "feature",
    title: "New Feature Released",
    desc: "Dispute Resolution Dashboard",
    time: "Posted 1 hour ago",
    color: "bg-blue-100",
  },
];

const paymentUpdates = [
  {
    date: "15 Aug 25",
    notification: "Payment from John Doe (Booking #1460)",
    status: "Success",
    action: "View",
  },
  {
    date: "14 Aug 25",
    notification: "Refund issued to Jane (Booking #1458)",
    status: "Pending",
    action: "Retry",
  },
  {
    date: "14 Aug 25",
    notification: "Payment failed – Card declined",
    status: "Failed",
    action: "Resolve",
  },
];

const statusColor: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
};

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  seats: number;
  fuelType: string;
  image?: string;
  available: boolean;
}

const NotificationsCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading vehicles
    setTimeout(() => {
      setVehicles([
        {
          id: "1",
          make: "Toyota",
          model: "RAV4",
          year: 2023,
          pricePerDay: 150,
          location: "Kigali",
          seats: 5,
          fuelType: "Gasoline",
          available: true,
        },
        // Add more vehicles...
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
            Loading vehicles...
          </div>
        </div>
      </div>
    );
  }

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
        {/* Payment Updates */}
        <div className="mt-6">
          <div className="font-semibold text-lg flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5" /> Payment Updates
          </div>
          <div className="bg-white rounded-xl shadow p-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Notification</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentUpdates.map((p, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{p.date}</td>
                    <td className="px-4 py-3">{p.notification}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColor[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className={`font-semibold underline text-sm ${
                          p.action === "View"
                            ? "text-blue-700"
                            : p.action === "Retry"
                            ? "text-yellow-700"
                            : "text-red-700"
                        }`}
                      >
                        {p.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default NotificationsCenterPage;
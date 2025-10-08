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

const NotificationsCenterPage: React.FC = () => {
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
      <div className="flex-1 p-8 space-y-8">
        {/* Booking Alerts */}
        <div>
          <div className="font-semibold text-lg flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5" /> Booking Alerts
          </div>
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            {bookingAlerts.map((alert, i) => (
              <div
                key={i}
                className={`flex items-center justify-between border-b last:border-b-0 py-3`}
              >
                <div className="flex items-center gap-3">
                  {alert.type === "success" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className={`font-semibold ${alert.type === "success" ? "text-green-700" : "text-red-700"}`}>
                      {alert.title}
                    </div>
                    <div className="text-xs text-gray-500">{alert.desc}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{alert.time}</span>
                  <input type="checkbox" checked={alert.checked} readOnly className="accent-blue-600 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Announcements */}
        <div>
          <div className="font-semibold text-lg flex items-center gap-2 mb-2">
            <Megaphone className="w-5 h-5" /> System Announcements
            <button className="ml-auto flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-1.5 rounded font-semibold text-sm shadow">
              <PlusCircle className="w-4 h-4" /> Add Announcement
            </button>
          </div>
          <div className="bg-white rounded-xl shadow p-0 mb-6">
            {announcements.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-6 py-4 border-b last:border-b-0 ${a.color}`}
              >
                <div className="flex-1">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-xs text-gray-600">{a.desc}</div>
                </div>
                <div className="text-xs text-gray-500">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Updates */}
        <div>
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
      </div>
    </div>
  );
};

export default NotificationsCenterPage;
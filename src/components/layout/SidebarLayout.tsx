import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2, Car, ClipboardList, MessageCircle, Users, User, LogOut,
} from "lucide-react";

const navItems = [
  { icon: <BarChart2 className="w-5 h-5" />, label: "Dashboard", to: "/dashboard" },
  { icon: <Car className="w-5 h-5" />, label: "Vehicles", to: "/vehicles" },
  { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings", to: "/booking" },
  { icon: <MessageCircle className="w-5 h-5" />, label: "Feedback", to: "/feedback" },
  { icon: <Users className="w-5 h-5" />, label: "Analytics", to: "/analytics" },
  { icon: <User className="w-5 h-5" />, label: "Profile & Account", to: "/profile" },
];

const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2c3e7d] text-white flex flex-col shadow-lg">
        {/* ...logo and user profile... */}
        <div className="px-4 py-6 border-b border-[#3d4f8f]">
          <h1 className="text-xl font-bold">AutoFleet Hub</h1>
        </div>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#3d4f8f]">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Jean Baptiste</div>
            <div className="text-xs text-blue-300 tracking-wide">ADMIN</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition text-sm ${
                location.pathname.startsWith(item.to)
                  ? "bg-[#3d4f8f]"
                  : "hover:bg-[#3d4f8f]/50"
              }`}
              onClick={() => navigate(item.to)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
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
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default SidebarLayout;
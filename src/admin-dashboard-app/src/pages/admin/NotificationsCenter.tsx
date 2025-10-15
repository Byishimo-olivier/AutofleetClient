import React from "react";
import { useSettings } from "@/contexts/SettingContext";
import { AlertCircle, Bell } from "lucide-react";

const NotificationsCenter: React.FC = () => {
  const { settings } = useSettings();

  const notifications = [
    {
      id: 1,
      type: "success",
      message: "Booking #1456 confirmed",
      time: "2 min ago",
    },
    {
      id: 2,
      type: "error",
      message: "Booking #1452 cancelled",
      time: "10 mins ago",
    },
    {
      id: 3,
      type: "info",
      message: "System Maintenance Scheduled for Aug 20, 2:00–4:00 AM",
      time: "Posted 1 hour ago",
    },
  ];

  return (
    <div className={`flex-1 p-8 ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className={`text-2xl font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
        Notifications Center
      </h1>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className={`flex items-center p-4 rounded-lg shadow ${notification.type === 'success' ? 'bg-green-100' : notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Bell className="w-6 h-6 mr-2" />
            <div>
              <p className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{notification.message}</p>
              <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsCenter;
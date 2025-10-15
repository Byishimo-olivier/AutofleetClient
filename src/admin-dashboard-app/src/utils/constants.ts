export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: "dashboard" },
  { label: "User Management", path: "/admin/users", icon: "users" },
  { label: "Vehicle Management", path: "/admin/vehicles", icon: "car" },
  { label: "Bookings Management", path: "/admin/bookings", icon: "book" },
  { label: "Reports & Analytics", path: "/admin/reports", icon: "report" },
  { label: "Disputes & Support", path: "/admin/disputes", icon: "support" },
  { label: "System Settings", path: "/admin/settings", icon: "settings" },
  { label: "Notifications Center", path: "/admin/notifications", icon: "notifications" },
];

export const STATISTICS = {
  totalBookings: "1,245",
  totalRevenue: "$54,320",
  activeVehicles: "342",
  activeUsers: "1,830",
};

export const QUICK_ACTIONS = [
  { label: "Add Vehicle", action: "add_vehicle" },
  { label: "Add User", action: "add_user" },
  { label: "Generate Report", action: "generate_report" },
  { label: "Settings", action: "settings" },
];
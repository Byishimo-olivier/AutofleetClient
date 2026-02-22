import React, { useEffect, useState } from "react";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  Plus,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PieChart,
  MessageCircle,
  Sliders,
  AlertCircle,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettings } from '@/contexts/SettingContxt';
import { apiClient } from '@/services/apiClient';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Default data structure (will be replaced with API data)
const defaultStats = [
  {
    label: "Total Bookings",
    value: "0",
    icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
    change: "0% this month",
    changeColor: "text-gray-600",
    badge: (
      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold flex items-center">
        0
      </span>
    ),
  },
  {
    label: "Total Revenue",
    value: "0 RWF",
    icon: <FileText className="w-6 h-6 text-green-600" />,
    change: "0% this month",
    changeColor: "text-gray-600",
  },
  {
    label: "Active Vehicles",
    value: "0",
    icon: <Car className="w-6 h-6 text-yellow-500" />,
    change: "0% utilization",
    changeColor: "text-gray-600",
  },
  {
    label: "Active Users",
    value: "0",
    icon: <Users className="w-6 h-6 text-blue-500" />,
    change: "+0 new users",
    changeColor: "text-gray-600",
  },
];

const quickActions = [
  {
    label: "Add Vehicle",
    icon: <Plus className="w-7 h-7 text-green-600" />,
    border: "border-green-200",
  },
  {
    label: "Add User",
    icon: <UserPlus className="w-7 h-7 text-blue-600" />,
    border: "border-blue-200",
  },
  {
    label: "Generate Report",
    icon: <FileText className="w-7 h-7 text-green-700" />,
    border: "border-green-200",
  },
  {
    label: "Settings",
    icon: <Settings className="w-7 h-7 text-blue-700" />,
    border: "border-blue-200",
  },
];

const defaultTrendsData: any[] = [];

const defaultTopRented: any[] = [];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { settings, formatPrice, t } = useSettings();

  // State for API data
  const [stats, setStats] = useState(defaultStats);
  const [trendsData, setTrendsData] = useState(defaultTrendsData);
  const [topRented, setTopRented] = useState(defaultTopRented);
  const [loading, setLoading] = useState(false);

  const adminNav = [
    { icon: <BarChart2 className="w-5 h-5" />, label: t.dashboard || "Dashboard", to: "/admin" },
    { icon: <Users className="w-5 h-5" />, label: "User Management", to: "/admin/users" },
    { icon: <Car className="w-5 h-5" />, label: "Vehicle Management", to: "/admin/vehicles" },
    { icon: <ClipboardList className="w-5 h-5" />, label: "Bookings Management", to: "/admin/bookings" },
    { icon: <PieChart className="w-5 h-5" />, label: "Reports & Analytics", to: "/admin/reports" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Disputes & Support", to: "/admin/disputes" },
    { icon: <Sliders className="w-5 h-5" />, label: "System Settings", to: "/admin/settings" },
    { icon: <AlertCircle className="w-5 h-5" />, label: "Notifications Center", to: "/admin/notifications" },
    { icon: <User className="w-5 h-5" />, label: t.profile || "Profile & Account", to: "/profile" },
  ];

  // Fetch real data from APIs
  // Define the expected dashboard stats type
  type DashboardStats = {
    totalBookings?: { value?: string | number; change?: string };
    totalRevenue?: { value?: string | number; change?: string };
    activeVehicles?: { value?: string | number; change?: string };
    activeUsers?: { value?: string | number; change?: string };
    [key: string]: any;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch dashboard stats
        const dashboardRes = await apiClient.get('/admin/stats/dashboard');
        if (dashboardRes.success && dashboardRes.data) {
          const data = dashboardRes.data as DashboardStats;
          console.log('Dashboard API response:', data); // Debug log

          // Extract values from the nested objects
          const totalBookings = parseInt(data.totalBookings?.value as string || "0");
          const totalRevenue = parseFloat(data.totalRevenue?.value as string || "0");
          const activeVehicles = parseInt(data.activeVehicles?.value as string || "0");
          const activeUsers = parseInt(data.activeUsers?.value as string || "0");

          // Extract growth percentages from the change strings
          const extractPercentage = (changeStr: string | undefined) => {
            if (!changeStr) return 0;
            const match = changeStr.match(/([+-]?\d+\.?\d*)%/);
            return match ? parseFloat(match[1]) : 0;
          };

          const bookingsGrowth = extractPercentage(data.totalBookings?.change);
          const revenueGrowth = extractPercentage(data.totalRevenue?.change);
          const utilizationPercent = extractPercentage(data.activeVehicles?.change);

          // Calculate new users from the change string
          const extractNewUsers = (changeStr: string | undefined) => {
            if (!changeStr) return 0;
            const match = changeStr.match(/\+(\d+) new users/);
            return match ? parseInt(match[1]) : 0;
          };
          const newUsers = extractNewUsers(data.activeUsers?.change);

          // Format revenue in Rwandan Francs
          const formatRwandanPrice = (amount: number) => {
            return new Intl.NumberFormat('rw-RW', {
              style: 'currency',
              currency: 'RWF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(amount);
          };

          // Update stats with real data while preserving design
          setStats([
            {
              ...defaultStats[0],
              value: totalBookings.toLocaleString(),
              change: data.totalBookings?.change || `${bookingsGrowth > 0 ? '+' : ''}${bookingsGrowth}% this month`,
              changeColor: bookingsGrowth > 0 ? "text-green-600" : bookingsGrowth < 0 ? "text-red-600" : "text-gray-600",
            },
            {
              ...defaultStats[1],
              value: formatRwandanPrice(totalRevenue), // Use Rwandan currency formatting
              change: data.totalRevenue?.change || `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}% this month`,
              changeColor: revenueGrowth > 0 ? "text-green-600" : revenueGrowth < 0 ? "text-red-600" : "text-gray-600",
            },
            {
              ...defaultStats[2],
              value: activeVehicles.toLocaleString(),
              change: data.activeVehicles?.change || `${utilizationPercent}% utilization`,
              changeColor: "text-blue-600",
            },
            {
              ...defaultStats[3],
              value: activeUsers.toLocaleString(),
              change: data.activeUsers?.change || `+${newUsers} new users`,
              changeColor: "text-green-600",
            },
          ]);
        }

        // Fetch trends data
        const trendsRes = await apiClient.get('/admin/stats/trends?period=8');
        if (trendsRes.success && trendsRes.data) {
          console.log('Trends API response:', trendsRes.data); // Debug log

          // Map the trends data to match our chart format
          interface TrendItem {
            month: string;
            bookings: number;
            revenue: number;
          }

          const formattedTrends: TrendItem[] = (trendsRes.data as Array<{ month: string; bookings: string | number; revenue: string | number }>).map(item => ({
            month: item.month,
            bookings: parseInt(item.bookings as string) || 0,
            revenue: parseFloat(item.revenue as string) || 0
          }));

          setTrendsData(formattedTrends);
        }

        // Fetch top vehicles with better error handling
        const topVehiclesRes = await apiClient.get('/admin/stats/top-vehicles?limit=5');
        if (topVehiclesRes.success && topVehiclesRes.data) {
          console.log('Top vehicles API response:', topVehiclesRes.data); // Debug log

          const colors = [
            "bg-red-200 text-red-700",
            "bg-blue-200 text-blue-700",
            "bg-green-200 text-green-700",
            "bg-yellow-200 text-yellow-700",
            "bg-purple-200 text-purple-700"
          ];

          // Handle different possible response structures
          let vehiclesData = topVehiclesRes.data;

          // If the response is wrapped in another object, unwrap it
          if (vehiclesData && typeof vehiclesData === 'object' && Array.isArray((vehiclesData as any)?.vehicles)) {
            vehiclesData = (vehiclesData as any).vehicles;
          }

          // Ensure we have an array
          if (Array.isArray(vehiclesData) && vehiclesData.length > 0) {
            const apiTopVehicles = vehiclesData.map((vehicle, index) => ({
              name: vehicle.name || `${vehicle.make || 'Unknown'} ${vehicle.model || 'Model'}`,
              color: colors[index] || colors[0],
              bookings: parseInt(vehicle.bookings || vehicle.totalBookings || vehicle.total_bookings || 0)
            }));

            setTopRented(apiTopVehicles);
          } else {
            console.log('No valid vehicle data found, keeping defaults');
            // Keep default data if no valid data is returned
          }
        } else {
          console.log('Top vehicles API failed, keeping defaults');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className={`flex-1 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Top search bar */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search ..."
              className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring w-80 shadow-sm ${settings.darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
            />
          </div>
          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-full shadow ${settings.darkMode ? 'bg-gray-700' : 'bg-white'}`}>
              <Bell className={`w-5 h-5 ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
            </button>
            <div className={`rounded-lg px-3 py-1 flex items-center gap-2 shadow ${settings.darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>
              {settings.language.toUpperCase()} <span className={`${settings.darkMode ? 'text-gray-400' : 'text-gray-400'}`}>▼</span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="mb-4">
            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading latest data...
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className={`rounded-lg shadow flex items-center px-6 py-4 gap-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`rounded-full p-3 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{stat.icon}</div>
              <div>
                <div className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                <div className={`text-2xl font-bold flex items-center ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                  {stat.badge}
                </div>
                <div className={`text-xs ${stat.changeColor}`}>{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className={`font-semibold mb-2 ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Quick Actions</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className={`flex flex-col items-center justify-center border-2 ${action.border} rounded-lg py-6 shadow transition ${settings.darkMode
                  ? 'bg-gray-800 hover:bg-gray-700'
                  : 'bg-white hover:bg-gray-50'
                  }`}
              >
                {action.icon}
                <span className={`mt-3 font-semibold text-base ${settings.darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Trends & Top Rented */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bookings & Revenue Trends */}
          <div className={`col-span-2 rounded-xl shadow-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`font-semibold mb-3 flex items-center ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
              Bookings & Revenue Trends
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={settings.darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="month" stroke={settings.darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis yAxisId="left" stroke={settings.darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis yAxisId="right" orientation="right" stroke={settings.darkMode ? '#9ca3af' : '#6b7280'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: settings.darkMode ? '#374151' : '#ffffff',
                      border: `1px solid ${settings.darkMode ? '#4b5563' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      color: settings.darkMode ? '#f9fafb' : '#1f2937'
                    }}
                    formatter={(value, name) => {
                      if (name === 'Revenue (RWF)') {
                        return [new Intl.NumberFormat('rw-RW', {
                          style: 'currency',
                          currency: 'RWF',
                          minimumFractionDigits: 0,
                        }).format(Number(value)), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#4c5fa3"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Bookings"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Revenue (RWF)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 5 Rented Vehicles */}
          <div className={`rounded-xl shadow-lg p-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`font-semibold mb-3 ${settings.darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Top 5 Rented Vehicles
            </div>
            <ul className="space-y-3">
              {topRented.map((v, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${v.color} inline-block`} />
                  <span className={`flex-1 ${settings.darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{v.name}</span>
                  <span className={`font-semibold ${settings.darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                    {v.bookings} bookings
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2, Car, ClipboardList, MessageCircle, Users, User, LogOut, Star, FileText
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiClient } from "@/services/apiClient";

function SidebarNavItem({ icon, label, to, active = false }: { icon: React.ReactNode; label: string; to: string; active?: boolean }) {
  const navigate = useNavigate();
  return (
    <div
      className={`flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition text-sm ${
        active ? "bg-[#3d4f8f]" : "hover:bg-[#3d4f8f]/50"
      }`}
      onClick={() => navigate(to)}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </div>
  );
}

const AnalyticsPage: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>("/analytics/dashboard/summary")
      .then(res => {
        if (res.success && res.data) {
          setStats(res.data.stats);
          setRevenueData(res.data.revenueData);
          setBookingsData(res.data.bookingsData);
          setVehicles(res.data.vehicles);
        } else {
          setError(res.message || "Failed to load analytics");
        }
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

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
          <div className="flex-1">
            <div className="text-sm font-semibold">Jean Baptiste</div>
            <div className="text-xs text-blue-300 tracking-wide">ADMIN</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarNavItem icon={<BarChart2 className="w-5 h-5" />} label="Dashboard" to="/dashboard" active={location.pathname.startsWith("/dashboard")} />
          <SidebarNavItem icon={<Car className="w-5 h-5" />} label="Vehicles" to="/vehicles" active={location.pathname.startsWith("/vehicles")} />
          <SidebarNavItem icon={<ClipboardList className="w-5 h-5" />} label="Bookings" to="/bookings" active={location.pathname.startsWith("/bookings")} />
          <SidebarNavItem icon={<MessageCircle className="w-5 h-5" />} label="Feedback" to="/feedback" active={location.pathname.startsWith("/feedback")} />
          <SidebarNavItem icon={<Users className="w-5 h-5" />} label="Analytics" to="/analytics" active={location.pathname.startsWith("/analytics")} />
          <SidebarNavItem icon={<User className="w-5 h-5" />} label="Profile & Account" to="/profile" active={location.pathname.startsWith("/profile")} />
        </nav>
        <div className="p-3">
          <button className="w-full flex items-center justify-center bg-[#f59e0b] hover:bg-[#d97706] text-white py-2.5 rounded-lg transition font-medium text-sm shadow-md">
            <LogOut className="mr-2 w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="text-center text-gray-500">Loading analytics...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
                  <div className="bg-gray-100 rounded-full p-3">
                    {stat.label === "Total Revenue" && <FileText className="w-5 h-5 text-blue-500" />}
                    {stat.label === "Total Bookings" && <ClipboardList className="w-5 h-5 text-green-500" />}
                    {stat.label === "Fleet Utilization" && <BarChart2 className="w-5 h-5 text-yellow-500" />}
                    {stat.label === "Avg Rating" && <Star className="w-5 h-5 text-blue-500" />}
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                    <div className="text-xl font-bold">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Revenue by Vehicle */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">Revenue by Vehicle</div>
                  <select className="border rounded px-2 py-1 text-xs bg-gray-50">
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#4c5fa3" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Bookings per Vehicle */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">Bookings per Vehicle</div>
                  <select className="border rounded px-2 py-1 text-xs bg-gray-50">
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bookingsData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#4c5fa3" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Detailed Vehicle Performance Table */}
            <div className="bg-white rounded-xl shadow-lg p-0 overflow-x-auto">
              <div className="font-semibold text-sm px-6 pt-6 pb-2">Detailed Vehicle Performance</div>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Revenue</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Bookings</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Utilization</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Avg Rating</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v: any, i: number) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="px-6 py-4 flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full bg-blue-500`}></span>
                        <div>
                          <div className="font-medium">{v.name}</div>
                          <div className="text-xs text-gray-500">{v.type}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{v.revenue}</td>
                      <td className="px-6 py-4">{v.bookings}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded">
                            <div
                              className="h-2 rounded bg-blue-500"
                              style={{ width: `${v.utilization}%` }}
                            />
                          </div>
                          <span className="text-xs">{v.utilization}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <span className="font-semibold">{v.rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Export Buttons */}
              <div className="flex justify-end gap-4 px-6 py-4">
                <button className="px-6 py-2 rounded bg-blue-900 text-white font-semibold shadow hover:bg-blue-800">
                  Export PDF
                </button>
                <button className="px-6 py-2 rounded bg-blue-100 text-blue-900 font-semibold shadow hover:bg-blue-200">
                  Export CSV
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
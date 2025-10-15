import React, { useEffect, useState } from 'react';
import { User, Car, ClipboardList, DollarSign, Star, LogOut, Plus, FileText, BarChart2, Users, MessageCircle } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';

const DashboardPage: React.FC = () => {
  const { settings, formatPrice, t } = useSettings();
  const [stats, setStats] = useState<any>({
    totalVehicles: 0,
    activeBookings: 0,
    monthlyRevenue: 0,
    avgRating: 0,
    fleetStatus: { available: 0, rented: 0, maintenance: 0 },
    bookingTrends: [],
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<any>("/analytics/dashboard/data"),
      apiClient.get<any>("/analytics/bookings/trends"),
      // REMOVE: apiClient.get<any>("/analytics/active-bookings"),
    ]).then(([dashboardRes, trendsRes]) => {
      if (dashboardRes.success && dashboardRes.data) {
        setStats((prev: any) => ({
          ...prev,
          totalVehicles: dashboardRes.data.totalVehicles,
          monthlyRevenue: dashboardRes.data.monthlyRevenue, // <-- CORRECT
          avgRating: dashboardRes.data.avgRating,
          fleetStatus: dashboardRes.data.fleetStatus,
          recentBookings: dashboardRes.data.recentBookings,
          activeBookings: dashboardRes.data.activeBookings,
        }));
      }
      if (trendsRes.success && trendsRes.data) {
        setStats((prev: any) => ({
          ...prev,
          bookingTrends: trendsRes.data.map((item: any) => ({
            date: item.date,
            bookings: item.bookings,
          })),
        }));
      }
      // REMOVE: activeRes handling
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SidebarLayout>
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-gray-500 text-sm">Here's what's happening with your fleet today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring w-64"
            />
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="bell">🔔</span>
            </button>
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="language">🌐</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Car className="w-6 h-6 text-blue-600" />}
            label="Total Vehicles"
            value={loading ? "..." : stats.totalVehicles}
            change=""
            changeColor=""
          />
          <StatCard
            icon={<ClipboardList className="w-6 h-6 text-green-600" />}
            label="Active Bookings"
            value={loading ? "..." : stats.activeBookings}
            change=""
            changeColor=""
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-red-600" />}
            label="Monthly Revenue"
            value={loading ? "..." : `$${stats.monthlyRevenue?.toLocaleString?.() ?? 0}`}
            change=""
            changeColor=""
          />
          <StatCard
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            label="Average Rating"
            value={loading ? "..." : stats.avgRating}
            change=""
            changeColor=""
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Trends */}
          <div className="bg-white rounded shadow p-6 col-span-2">
            <div className="font-semibold mb-2">Booking Trends</div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                {stats.bookingTrends && stats.bookingTrends.length > 0 ? (
                  <LineChart data={stats.bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#4c5fa3" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No booking trends data available.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fleet Status */}
          <div className="bg-white rounded shadow p-6">
            <div className="font-semibold mb-2">Fleet Status</div>
            <div className="space-y-2">
              <FleetStatus label="Available" value={stats.fleetStatus.available} color="bg-green-500" />
              <FleetStatus label="Rented" value={stats.fleetStatus.rented} color="bg-blue-500" />
              <FleetStatus label="Maintenance" value={stats.fleetStatus.maintenance} color="bg-yellow-500" />
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded shadow p-6 col-span-2">
            <div className="font-semibold mb-2">Recent Bookings</div>
            <div className="space-y-2">
              {loading
                ? <div>Loading...</div>
                : stats.recentBookings?.map((b: any, i: number) => (
                  <BookingRow
                    key={i}
                    name={b.customer}
                    car={`${b.vehicle} - ${b.duration}`}
                    status={b.status}
                  />
                ))}
            </div>
          </div>
          {/* Quick Actions */}
          <div className="bg-white rounded shadow p-6">
            <div className="font-semibold mb-2">Quick Actions</div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center bg-blue-100 text-blue-700 py-2 rounded font-semibold hover:bg-blue-200 transition">
                <Plus className="w-4 h-4 mr-2" /> Add New Vehicle
              </button>
              <button className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-2 rounded font-semibold hover:bg-gray-200 transition">
                <FileText className="w-4 h-4 mr-2" /> Create Manual Booking
              </button>
              <button className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-2 rounded font-semibold hover:bg-gray-200 transition">
                <BarChart2 className="w-4 h-4 mr-2" /> Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

// Stat card
function StatCard({ icon, label, value, change, changeColor }: { icon: React.ReactNode; label: string; value: string | number; change: string; changeColor: string }) {
  return (
    <div className="bg-white rounded shadow p-4 flex items-center space-x-4">
      <div className="bg-gray-100 rounded-full p-3">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-bold">{value}</div>
        {change && <div className={`text-xs ${changeColor}`}>{change}</div>}
      </div>
    </div>
  );
}

// Fleet status bar
function FleetStatus({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value} vehicles</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2 mb-2">
        <div className={`${color} h-2 rounded`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// Booking row
function BookingRow({ name, car, status }: { name: string; car: string; status: string }) {
  let color = "bg-gray-200 text-gray-700";
  if (status === "confirmed") color = "bg-green-100 text-green-700";
  if (status === "pending") color = "bg-yellow-100 text-yellow-700";
  if (status === "active") color = "bg-blue-100 text-blue-700";
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div>
        <div className="font-semibold">{name}</div>
        <div className="text-xs text-gray-500">{car}</div>
      </div>
      <span className={`px-3 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>
    </div>
  );
}

export default DashboardPage;


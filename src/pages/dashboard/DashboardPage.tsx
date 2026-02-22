import React, { useEffect, useState } from 'react';
import { Car, ClipboardList, DollarSign, Plus, FileText, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { formatPrice } = useSettings();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalVehicles: 0,
    activeBookings: 0,
    totalBookings: 0,
    myRevenue: 0,
    platformRevenue: 0,
    avgRating: 0,
    fleetStatus: { available: 0, rented: 0, maintenance: 0 },
    bookingTrends: [],
    recentBookings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get<any>("/analytics/dashboard/data")
      .then((dashboardRes) => {
        if (dashboardRes.success && dashboardRes.data) {
          setStats({
            totalVehicles: dashboardRes.data.totalVehicles ?? 0,
            activeBookings: dashboardRes.data.activeBookings ?? 0,
            totalBookings: dashboardRes.data.totalBookings ?? 0,
            myRevenue: dashboardRes.data.myRevenue ?? 0,
            platformRevenue: dashboardRes.data.platformRevenue ?? 0,
            avgRating: dashboardRes.data.avgRating ?? 0,
            fleetStatus: dashboardRes.data.fleetStatus ?? { available: 0, rented: 0, maintenance: 0 },
            bookingTrends: Array.isArray(dashboardRes.data.bookingTrends)
              ? dashboardRes.data.bookingTrends.map((item: any) => ({
                date: item.date,
                bookings: item.bookings,
              }))
              : [],
            recentBookings: dashboardRes.data.recentBookings ?? [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalFleet =
    (stats.fleetStatus.available ?? 0) +
    (stats.fleetStatus.rented ?? 0) +
    (stats.fleetStatus.maintenance ?? 0);

  const fleetPct = (value: number) =>
    totalFleet > 0 ? Math.min(Math.round((value / totalFleet) * 100), 100) : 0;

  const fmt = (amount: number) =>
    formatPrice ? formatPrice(amount) : `₣${amount.toLocaleString()}`;

  const isOwner = user?.role === 'owner';

  return (
    <div className="flex-1 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Welcome back!</h1>
          <p className="text-gray-500 text-xs md:text-sm">Here's what's happening with your fleet today.</p>
        </div>
        <div className="flex items-center space-x-3 md:space-x-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            className="px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring flex-1 sm:w-64"
          />
          <button className="bg-white p-2 rounded-full shadow shrink-0">
            <span role="img" aria-label="bell">🔔</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          icon={<Car className="w-6 h-6 text-blue-600" />}
          label="Total Vehicles"
          value={loading ? "..." : stats.totalVehicles}
        />
        <StatCard
          icon={<ClipboardList className="w-6 h-6 text-green-600" />}
          label="Active Bookings"
          value={loading ? "..." : stats.activeBookings}
        />
        <StatCard
          icon={<ClipboardList className="w-6 h-6 text-purple-600" />}
          label="Total Bookings"
          value={loading ? "..." : stats.totalBookings}
        />
        {/* Platform Revenue card — for owners also shows their personal revenue */}
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          label="Platform Revenue"
          value={loading ? "..." : fmt(stats.platformRevenue)}
          subLabel={isOwner && !loading ? `My Revenue: ${fmt(stats.myRevenue)}` : undefined}
        />
      </div>


      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded shadow p-4 md:p-6 lg:col-span-2">
          <div className="font-semibold mb-4 text-sm md:text-base">Booking Trends (Last 30 Days)</div>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {stats.bookingTrends && stats.bookingTrends.length > 0 ? (
                <LineChart data={stats.bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#4c5fa3"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  {loading ? "Loading trends..." : "No booking trends data available."}
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Status */}
        <div className="bg-white rounded shadow p-4 md:p-6">
          <div className="font-semibold mb-4 text-sm md:text-base">Fleet Status</div>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : (
            <div className="space-y-4">
              <FleetStatusBar
                label="Available"
                value={stats.fleetStatus.available}
                pct={fleetPct(stats.fleetStatus.available)}
                color="bg-green-500"
              />
              <FleetStatusBar
                label="Rented"
                value={stats.fleetStatus.rented}
                pct={fleetPct(stats.fleetStatus.rented)}
                color="bg-blue-500"
              />
              <FleetStatusBar
                label="Maintenance"
                value={stats.fleetStatus.maintenance}
                pct={fleetPct(stats.fleetStatus.maintenance)}
                color="bg-yellow-500"
              />
              {totalFleet === 0 && (
                <div className="text-gray-400 text-sm text-center pt-2">No vehicles in fleet.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded shadow p-4 md:p-6 lg:col-span-2">
          <div className="font-semibold mb-4 text-sm md:text-base">Recent Bookings</div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : stats.recentBookings?.length > 0 ? (
              stats.recentBookings.map((b: any, i: number) => (
                <BookingRow
                  key={i}
                  name={b.customer}
                  car={`${b.vehicle} — ${b.duration}`}
                  status={b.status}
                />
              ))
            ) : (
              <div className="text-gray-400 text-sm">No recent bookings.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded shadow p-4 md:p-6">
          <div className="font-semibold mb-4 text-sm md:text-base">Quick Actions</div>
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
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
}) {
  return (
    <div className="bg-white rounded shadow p-4 flex items-center space-x-4">
      <div className="bg-gray-100 rounded-full p-3">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-bold">{value}</div>
        {subLabel && (
          <div className="text-xs text-green-600 font-medium mt-0.5">{subLabel}</div>
        )}
      </div>
    </div>
  );
}

function FleetStatusBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-gray-500">{value} vehicles ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-2">
        <div className={`${color} h-2 rounded transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BookingRow({ name, car, status }: { name: string; car: string; status: string }) {
  let color = "bg-gray-200 text-gray-700";
  if (status === "confirmed") color = "bg-green-100 text-green-700";
  if (status === "pending") color = "bg-yellow-100 text-yellow-700";
  if (status === "active") color = "bg-blue-100 text-blue-700";
  if (status === "completed") color = "bg-purple-100 text-purple-700";
  if (status === "cancelled") color = "bg-red-100 text-red-700";
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

import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Car,
  ClipboardList,
  MessageCircle,
  Users,
  User,
  LogOut,
  Grid,
  List,
  MoreVertical,
} from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';

const statusColors: Record<string, string> = {
  Cancelled: "text-red-600",
  Ongoing: "text-blue-600",
  Completed: "text-green-600",
  Pending: "text-yellow-600",
  Confirmed: "text-blue-600",
  Active: "text-blue-600",
};

const dotColors: Record<string, string> = {
  Cancelled: "bg-red-500",
  Ongoing: "bg-blue-500",
  Completed: "bg-green-500",
  Pending: "bg-yellow-500",
  Confirmed: "bg-blue-500",
  Active: "bg-blue-500",
};

const statusFilters = ["All", "Pending", "Confirmed", "Active", "Completed", "Cancelled"];

const ITEMS_PER_PAGE = 10;

const BookingPage: React.FC = () => {
  const { settings, formatPrice, t } = useSettings();
  const [bookings, setBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    ongoingBookings: 0, // for /active endpoint
  });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(ITEMS_PER_PAGE),
      ...(status !== "All" && { status: status.toLowerCase() }),
      ...(dateFrom && { startDate: dateFrom }),
      ...(dateTo && { endDate: dateTo }),
      ...(search && { search }),
    }).toString();

    const res = await apiClient.get<{ bookings: any[]; pagination: any }>(`/bookings?${params}`);
    if (res.success && res.data) {
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } else {
      setBookings([]);
      setTotalPages(1);
    }
    setLoading(false);
  };

  // Fetch stats and active bookings count
  const fetchStats = async () => {
    const [statsRes, activeRes] = await Promise.all([
      apiClient.get<any>("/bookings/stats/overview"),
      apiClient.get<any>("/bookings/active"),
    ]);
    let ongoingBookings = 0;
    if (activeRes.success && Array.isArray(activeRes.data)) {
      ongoingBookings = activeRes.data.length;
    }
    if (statsRes.success && statsRes.data) {
      setStats({
        totalBookings: statsRes.data.totalBookings,
        activeBookings: statsRes.data.activeBookings || statsRes.data.active || 0,
        pendingBookings: statsRes.data.pendingBookings || statsRes.data.pending || 0,
        completedBookings: statsRes.data.completedBookings || statsRes.data.completed || 0,
        totalRevenue: statsRes.data.totalRevenue || 0,
        ongoingBookings,
      });
    } else {
      setStats((prev: any) => ({ ...prev, ongoingBookings }));
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line
  }, [currentPage, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  return (
    <SidebarLayout>
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Top search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search ..."
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring w-80 bg-white shadow-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="bell">🔔</span>
            </button>
            <button className="bg-white p-2 rounded-full shadow">
              <span role="img" aria-label="language">🌐</span>
            </button>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
              EN <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Bookings</div>
              <div className="text-xl font-bold">{stats.totalBookings}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Car className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Active Bookings</div>
              <div className="text-xl font-bold">{stats.activeBookings}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <Grid className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Pending Approval</div>
              <div className="text-xl font-bold">{stats.pendingBookings}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <BarChart2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Total Revenue</div>
              <div className="text-xl font-bold">${stats.totalRevenue}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow flex items-center px-6 py-4 gap-4">
            <div className="bg-gray-100 rounded-full p-3">
              <ClipboardList className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Ongoing Bookings</div>
              <div className="text-xl font-bold">{stats.ongoingBookings}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <form
          className="flex flex-wrap items-center gap-4 mb-4"
          onSubmit={handleSearch}
        >
          <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search bookings..."
              className="bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            className="border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
          <div className="flex gap-2 ml-auto">
            {statusFilters.map((f, i) => (
              <button
                key={i}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  status === f
                    ? "bg-[#4c5fa3] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setStatus(f);
                  setCurrentPage(1);
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </form>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Booking ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Date Range</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="px-6 py-4 font-semibold text-[#4c5fa3] underline cursor-pointer">
                      #{b.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{b.vehicle || `${b.make} ${b.model}`}</div>
                      <div className="text-xs text-gray-500">{b.plate || b.license_plate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">
                        {b.customer || b.customer_first_name + " " + b.customer_last_name}
                      </div>
                      <div className="text-xs text-gray-500">{b.email || b.customer_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">
                        {b.dateFrom || b.start_date}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {b.dateTo || b.end_date}
                      </div>
                    </td>
                    <td className="px-6 py-4">{b.duration || b.duration_days + " days"}</td>
                    <td className="px-6 py-4 font-bold">${b.amount || b.total_amount}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`inline-block w-2 h-2 rounded-full ${dotColors[(b.status || "").charAt(0).toUpperCase() + (b.status || "").slice(1)] || "bg-gray-400"}`}></span>
                        <span className={statusColors[(b.status || "").charAt(0).toUpperCase() + (b.status || "").slice(1)] || "text-gray-500"}>
                          {(b.status || "").charAt(0).toUpperCase() + (b.status || "").slice(1)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-600 hover:text-blue-700">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              className="px-3 py-1 rounded-lg hover:bg-gray-200 transition"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded-lg ${
                  currentPage === page
                    ? "bg-[#4c5fa3] text-white"
                    : "hover:bg-gray-200 transition"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded-lg hover:bg-gray-200 transition"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default BookingPage;


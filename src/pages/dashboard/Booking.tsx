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
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Bell,
  Globe,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import { FaBan } from 'react-icons/fa';
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';

const statusColors: Record<string, string> = {
  cancelled: "text-red-600",
  ongoing: "text-blue-600",
  completed: "text-green-600",
  pending: "text-yellow-600",
  confirmed: "text-blue-600",
  active: "text-blue-600",
};

const dotColors: Record<string, string> = {
  cancelled: "bg-red-500",
  ongoing: "bg-blue-500",
  completed: "bg-green-500",
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  active: "bg-blue-500",
};

const statusFilters = ["All", "Pending", "Confirmed", "Active", "Completed", "Cancelled"];

const ITEMS_PER_PAGE = 10;

interface Booking {
  id: string;
  vehicle?: string;
  vehicle_id?: string;
  make?: string;
  model?: string;
  plate?: string;
  license_plate?: string;
  customer?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  email?: string;
  customer_email?: string;
  dateFrom?: string;
  start_date?: string;
  dateTo?: string;
  end_date?: string;
  duration?: string;
  duration_days?: number;
  amount?: number;
  total_amount?: number;
  status?: string;
  created_at?: string;
  pickup_location?: string;
  dropoff_location?: string;
}

interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  ongoingBookings: number;
}

const BookingPage: React.FC = () => {
  const { settings, formatPrice, t } = useSettings();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    ongoingBookings: 0,
  });
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Confirm booking handler (same as admin)
  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await apiClient.put(`/bookings/${bookingId}/status`, { status: 'confirmed' });
      if (res.success) {
        fetchBookings();
      } else {
        alert(res.message || 'Failed to confirm booking');
      }
    } catch (error) {
      alert('Error confirming booking');
    }
  };

  // Delete booking handler
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      const res = await apiClient.delete(`/bookings/${bookingId}`);
      if (res.success) {
        fetchBookings();
      } else {
        alert(res.message || "Failed to delete booking.");
      }
    } catch (error) {
      alert("Error deleting booking.");
    }
  };

  // Edit booking handler
  const handleEditBooking = (booking: Booking) => {
    // Example: navigate to edit page
    // navigate(`/dashboard/bookings/edit/${booking.id}`, { state: { booking } });

    // Or open a modal (implement your modal logic here)
    alert(`Edit booking ${booking.id} (implement modal or navigation)`);
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
        ...(status !== "All" && { status: status.toLowerCase() }),
        ...(dateFrom && { startDate: dateFrom }),
        ...(dateTo && { endDate: dateTo }),
        ...(search && { search }),
      }).toString();

      const res = await apiClient.get<{ bookings: Booking[]; pagination: any }>(`/bookings?${params}`);

      if (res.success && res.data) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        setBookings([]);
        setTotalPages(1);
        console.error('Failed to fetch bookings:', res.message);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats and active bookings count
  const fetchStats = async () => {
    try {
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
          totalBookings: statsRes.data.totalBookings || 0,
          activeBookings: statsRes.data.activeBookings || statsRes.data.active || 0,
          pendingBookings: statsRes.data.pendingBookings || statsRes.data.pending || 0,
          completedBookings: statsRes.data.completedBookings || statsRes.data.completed || 0,
          totalRevenue: statsRes.data.totalRevenue || 0,
          ongoingBookings,
        });
      } else {
        setStats((prev) => ({ ...prev, ongoingBookings }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBookings(), fetchStats()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, status, dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCustomerName = (booking: Booking) => {
    if (booking.customer) return booking.customer;
    if (booking.customer_first_name && booking.customer_last_name) {
      return `${booking.customer_first_name} ${booking.customer_last_name}`;
    }
    return 'Unknown Customer';
  };

  const getVehicleName = (booking: Booking) => {
    if (booking.vehicle) return booking.vehicle;
    if (booking.make && booking.model) return `${booking.make} ${booking.model}`;
    return 'Unknown Vehicle';
  };

  const getCustomerEmail = (booking: Booking) => {
    return booking.email || booking.customer_email || 'No email';
  };

  const getPlateNumber = (booking: Booking) => {
    return booking.plate || booking.license_plate || 'No plate';
  };

  const getBookingAmount = (booking: Booking) => {
    const amount = booking.amount || booking.total_amount || 0;
    return formatPrice ? formatPrice(amount) : `₣${amount}`;
  };

  const getDuration = (booking: Booking) => {
    if (booking.duration) return booking.duration;
    if (booking.duration_days) return `${booking.duration_days} days`;
    return 'N/A';
  };

  const getDateRange = (booking: Booking) => {
    const startDate = booking.dateFrom || booking.start_date;
    const endDate = booking.dateTo || booking.end_date;
    return {
      start: startDate ? formatDate(startDate) : 'N/A',
      end: endDate ? formatDate(endDate) : 'N/A'
    };
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    return statusColors[normalizedStatus] || "text-gray-500";
  };

  const getStatusDotColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    return dotColors[normalizedStatus] || "bg-gray-400";
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const handleSetUnavailable = async (vehicleId: number) => {
    try {
      await apiClient.put(`/vehicles/${vehicleId}`, { status: 'inactive' });
      alert('Vehicle marked as unavailable!');
      // Optionally refresh bookings/vehicles list here
    } catch (err) {
      alert('Failed to mark vehicle as unavailable.');
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 ${settings?.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              className={`pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-96 shadow-sm transition-colors ${settings?.darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`ml-3 p-3 rounded-lg transition-colors ${settings?.darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-50 text-gray-700'
              } border shadow-sm disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-3 lg:gap-4 ml-auto lg:ml-0">
          <button className={`p-3 rounded-lg shadow-sm transition-colors ${settings?.darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            }`}>
            <Bell className="w-4 h-4" />
          </button>
          <div className={`rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
            <span className="text-sm font-medium">EN</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <div className={`rounded-xl shadow-sm p-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-full p-3">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">Total Bookings</p>
              <p className="text-xl md:text-2xl font-bold">{stats.totalBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-full p-3">
              <Car className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">Active Bookings</p>
              <p className="text-xl md:text-2xl font-bold">{stats.activeBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">Pending Approval</p>
              <p className="text-xl md:text-2xl font-bold">{stats.pendingBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">Total Revenue</p>
              <p className="text-xl md:text-2xl font-bold truncate">{formatPrice ? formatPrice(stats.totalRevenue) : `₣${stats.totalRevenue.toLocaleString()}`}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 rounded-full p-3">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-500 font-medium truncate">Ongoing Bookings</p>
              <p className="text-xl md:text-2xl font-bold">{stats.ongoingBookings.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`rounded-xl shadow-sm p-6 mb-6 transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${settings?.darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              className={`border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${settings?.darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div className="flex gap-2 ml-auto">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === filter
                  ? "bg-blue-600 text-white shadow-md"
                  : settings?.darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                onClick={() => handleStatusChange(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className={`rounded-xl shadow-sm overflow-hidden transition-colors ${settings?.darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className={`${settings?.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date Range</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-500">Loading bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <ClipboardList className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-gray-500 text-lg">No bookings found</span>
                      <span className="text-gray-400 text-sm">Try adjusting your filters</span>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const dateRange = getDateRange(booking);
                  return (
                    <tr key={booking.id} className={`hover:${settings?.darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                          #{booking.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{getVehicleName(booking)}</div>
                          <div className="text-sm text-gray-500">{getPlateNumber(booking)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{getCustomerName(booking)}</div>
                          <div className="text-sm text-gray-500">{getCustomerEmail(booking)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{dateRange.start}</div>
                          <div className="text-sm text-gray-500">to {dateRange.end}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{getDuration(booking)}</td>
                      <td className="px-6 py-4 font-bold">{getBookingAmount(booking)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${getStatusDotColor(booking.status || '')}`}></span>
                          <span className={`font-semibold ${getStatusColor(booking.status || '')}`}>
                            {formatStatus(booking.status || '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteBooking(booking.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {booking.status?.toLowerCase() === 'pending' && (
                            <button
                              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              onClick={() => handleConfirmBooking(booking.id)}
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => handleSetUnavailable(Number(booking.vehicle_id))}
                            title="Mark vehicle as unavailable"
                            style={{
                              background: '#f87171',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer'
                            }}
                          >
                            <FaBan color="#fff" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${settings?.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, stats.totalBookings)} of {stats.totalBookings} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${settings?.darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                        ? "bg-blue-600 text-white"
                        : settings?.darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${settings?.darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;


import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingContxt";
import { apiClient } from '@/services/apiClient';
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  FileText,
  Settings as SettingsIcon,
  Bell,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Download,
  Fuel,
  CheckSquare,
  Square,
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

const statusColor: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  disputed: "bg-red-100 text-red-700",
};

const paymentStatusColor: Record<string, string> = {
  paid: "text-green-700",
  pending: "text-yellow-700",
  failed: "text-red-700",
  refunded: "text-blue-700",
};

interface Booking {
  id: number;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  vehicle_name: string;
  vehicle_plate: string;
  owner_name: string;
  owner_email: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  created_at: string;
}

interface BookingStats {
  all: number;
  pending: number;
  completed: number;
  cancelled: number;
  disputed: number;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  location: string;
  seats: number;
  fuelType: string;
  available: boolean;
}

const BookingsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();
  
  // State management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats>({
    all: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState(""); // Changed from "month" to ""
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch bookings with filters
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateRangeFilter && { dateRange: dateRangeFilter }),
      });

      const response = await apiClient.get(`/bookings/admin/all?${params}`);
      if (response.success && response.data) {
        // Add a type assertion to help TypeScript understand the structure
        const data = response.data as { bookings: Booking[]; pagination?: { totalPages: number } };
        setBookings(data.bookings || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch booking stats for tabs
  const fetchBookingStats = async () => {
    try {
      const response = await apiClient.get('/bookings/admin/stats/categories');
      if (response.success && response.data) {
        const data = response.data as Partial<BookingStats>;
        setBookingStats({
          all: data.all ?? 0,
          pending: data.pending ?? 0,
          completed: data.completed ?? 0,
          cancelled: data.cancelled ?? 0,
          disputed: data.disputed ?? 0,
        });
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedBookings.length === 0) {
      alert('Please select bookings to update');
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await apiClient.put('/bookings/admin/bulk-status', {
        bookingIds: selectedBookings,
        status: newStatus
      });

      if (response.success) {
        await fetchBookings();
        await fetchBookingStats();
        setSelectedBookings([]);
        alert('Bookings updated successfully');
      } else {
        alert('Failed to update bookings');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating bookings');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams({
        format: 'csv',
        ...(statusFilter && { status: statusFilter }),
        ...(dateRangeFilter && { dateRange: dateRangeFilter }),
      });

      const response = await fetch(`/api/bookings/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Toggle booking selection
  const toggleBookingSelection = (bookingId: number) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  // Select all bookings
  const toggleSelectAll = () => {
    if (selectedBookings.length === bookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookings.map(b => b.id));
    }
  };

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startFormatted} → ${endFormatted}`;
  };

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Filter bookings by tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
        return bookings.filter(b => b.status === 'pending');
      case 'completed':
        return bookings.filter(b => b.status === 'completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'cancelled' || b.status === 'disputed');
      default:
        return bookings;
    }
  };

  // Load vehicles (keeping your existing logic)
  useEffect(() => {
    setTimeout(() => {
      setVehicles([
        {
          id: "1",
          make: "Toyota",
          model: "RAV4",
          year: 2023,
          pricePerDay: 150,
          location: "Kigali",
          seats: 5,
          fuelType: "Gasoline",
          available: true,
        },
        // Add more vehicles...
      ]);
    }, 1000);
  }, []);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchQuery, statusFilter, dateRangeFilter]);

  useEffect(() => {
    fetchBookingStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchBookings();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredBookings = getFilteredBookings();

  if (loading && bookings.length === 0) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
            Loading bookings...
          </div>
        </div>
      </div>
    );
  }

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
      <div className="flex-1 p-8">
        {/* Top search/filter/export */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 bg-white w-80 shadow-sm">
            <Search className="w-5 h-5 text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Search by customer name, email, or booking ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder-gray-600 font-medium"
            />
          </div>
          <select 
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm min-w-[160px] font-medium"
          >
            <option value="" className="text-gray-900 font-medium">All Time</option>
            <option value="month" className="text-gray-900 font-medium">This Month</option>
            <option value="last_month" className="text-gray-900 font-medium">Last Month</option>
            <option value="quarter" className="text-gray-900 font-medium">This Quarter</option>
            <option value="year" className="text-gray-900 font-medium">This Year</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm min-w-[140px] font-medium"
          >
            <option value="" className="text-gray-900 font-medium">All Status</option>
            <option value="pending" className="text-gray-900 font-medium">Pending</option>
            <option value="confirmed" className="text-gray-900 font-medium">Confirmed</option>
            <option value="completed" className="text-gray-900 font-medium">Completed</option>
            <option value="cancelled" className="text-gray-900 font-medium">Cancelled</option>
            <option value="disputed" className="text-gray-900 font-medium">Disputed</option>
          </select>
          
          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-3">
              <select 
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm font-medium"
                disabled={bulkActionLoading}
              >
                <option value="" className="text-gray-900 font-medium">Bulk Actions</option>
                <option value="confirmed" className="text-gray-900 font-medium">Mark as Confirmed</option>
                <option value="completed" className="text-gray-900 font-medium">Mark as Completed</option>
                <option value="cancelled" className="text-gray-900 font-medium">Mark as Cancelled</option>
              </select>
              <span className="text-sm text-gray-700 font-semibold bg-blue-100 px-3 py-2 rounded-lg">
                {selectedBookings.length} selected
              </span>
            </div>
          )}
          
          <button 
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 bg-[#1746a2] hover:bg-[#12367a] text-white px-6 py-3 rounded-lg font-semibold shadow-lg ml-auto disabled:opacity-50 transition-all"
          >
            <Download className="w-5 h-5" /> 
            {exportLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>

        {/* Debug Info - temporary */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <strong className="text-blue-800">Debug Info:</strong>
          <div className="grid grid-cols-4 gap-4 mt-2 text-blue-700">
            <div>Total bookings: <span className="font-bold">{bookings.length}</span></div>
            <div>Filtered bookings: <span className="font-bold">{filteredBookings.length}</span></div>
            <div>Active tab: <span className="font-bold">{activeTab}</span></div>
            <div>Date filter: <span className="font-bold">"{dateRangeFilter || 'All Time'}"</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mb-6 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-bold flex items-center gap-2 transition-all ${
              activeTab === 'all' 
                ? 'border-b-3 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All bookings 
            <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-bold">
              {bookingStats.all}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`pb-3 font-bold flex items-center gap-2 transition-all ${
              activeTab === 'pending' 
                ? 'border-b-3 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Pending Approval 
            <span className="bg-yellow-400 text-white text-xs px-3 py-1 rounded-full font-bold">
              {bookingStats.pending}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`pb-3 font-bold flex items-center gap-2 transition-all ${
              activeTab === 'completed' 
                ? 'border-b-3 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Completed Rentals 
            <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold">
              {bookingStats.completed}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 font-bold flex items-center gap-2 transition-all ${
              activeTab === 'cancelled' 
                ? 'border-b-3 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Canceled / Disputed 
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">
              {bookingStats.cancelled + bookingStats.disputed}
            </span>
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={toggleSelectAll} className="hover:bg-gray-100 p-1 rounded">
                      {selectedBookings.length === filteredBookings.length && filteredBookings.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">BOOKING ID</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">CUSTOMER</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">VEHICLE</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">OWNER/AGENCY</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">DATE RANGE</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">PAYMENT</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">Loading bookings...</div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">No bookings found</div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleBookingSelection(booking.id)}
                          className="hover:bg-gray-100 p-1 rounded"
                        >
                          {selectedBookings.includes(booking.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600 text-base">
                          #{booking.booking_reference || booking.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{booking.customer_name}</div>
                        <div className="text-sm text-gray-600 font-medium">{booking.customer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{booking.vehicle_name}</div>
                        <div className="text-sm text-gray-600 font-medium">{booking.vehicle_plate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{booking.owner_name}</div>
                        <div className="text-sm text-gray-600 font-medium">{booking.owner_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColor[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{formatDateRange(booking.start_date, booking.end_date)}</div>
                        <div className="text-sm text-gray-600 font-medium">
                          {booking.total_days || calculateDays(booking.start_date, booking.end_date)} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{formatPrice(booking.total_amount)}</div>
                        <div className={`text-sm font-bold ${paymentStatusColor[booking.payment_status] || 'text-gray-500'}`}>
                          {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-lg transition-colors"
                            title="Edit booking"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this booking?')) {
                                // Handle delete booking
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-lg transition-colors"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-bold ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-2 border-blue-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Vehicles List (keeping your existing design) */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Available Vehicles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`rounded-lg shadow-lg overflow-hidden ${
                  settings.darkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="h-48 bg-gray-300 flex items-center justify-center">
                  <Car className={`w-16 h-16 ${settings.darkMode ? "text-gray-600" : "text-gray-400"}`} />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          settings.darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p
                        className={`text-sm ${
                          settings.darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {vehicle.year}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        vehicle.available
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vehicle.available ? "Available" : "Unavailable"}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Search className={`w-4 h-4 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <span
                        className={`text-sm ${
                          settings.darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {vehicle.location}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className={`w-4 h-4 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <span
                        className={`text-sm ${
                          settings.darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {vehicle.seats} seats
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Fuel className={`w-4 h-4 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <span
                        className={`text-sm ${
                          settings.darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {vehicle.fuelType}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <span
                        className={`text-2xl font-bold ${
                          settings.darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatPrice(vehicle.pricePerDay)}
                      </span>
                      <span
                        className={`text-sm ${
                          settings.darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        /day
                      </span>
                    </div>
                    <button
                      disabled={!vehicle.available}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        vehicle.available
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {vehicle.available ? "Book Now" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsManagementPage;
import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingContxt";
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
  PlusCircle,
  Eye,
  X,
  Fuel,
  Download,
  Filter,
  Mail,
  CheckSquare,
  Flag,
  Trash2,
  Search,
  Star,
  Calendar,
  TrendingUp,
  Plus,
  RefreshCw
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "@/services/apiClient";

interface Feedback {
  id: string;
  rating: number;
  service_rating?: number;
  vehicle_condition_rating?: number;
  comment?: string;
  created_at: string;
  updated_at?: string;
  booking_id: string;
  customer_id: string;
  vehicle_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  start_date: string;
  end_date: string;
  total_amount: number;
}

interface FeedbackAnalytics {
  overview: {
    totalFeedback: number;
    averageRating: number;
    averageServiceRating: number;
    averageConditionRating: number;
    positiveFeedback: number;
    negativeFeedback: number;
    withComments: number;
  };
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  trends: Array<{
    date: string;
    feedbackCount: number;
    averageRating: number;
  }>;
  topVehicles?: Array<{
    id: string;
    vehicle: string;
    licensePlate: string;
    totalReviews: number;
    averageRating: number;
    averageServiceRating: number;
    averageConditionRating: number;
  }>;
  recentFeedback: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    vehicle: string;
    customer: string;
  }>;
}

interface Dispute {
  id: string;
  bookingId: string;
  customer: {
    id: string;
    initials: string;
    name: string;
    email: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  issue: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

interface Ticket {
  id: string;
  user: {
    id: string;
    initials: string;
    name: string;
    email: string;
  };
  subject: string;
  description: string;
  category: 'payment' | 'account' | 'vehicle' | 'service' | 'technical' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  flagged: "bg-red-100 text-red-700",
  rejected: "bg-gray-100 text-gray-700",
  open: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-700",
};

const priorityColor: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
  urgent: "bg-red-200 text-red-800",
};

const categoryColor: Record<string, string> = {
  payment: "bg-blue-700 text-white",
  account: "bg-purple-700 text-white",
  vehicle: "bg-green-700 text-white",
  service: "bg-orange-700 text-white",
  technical: "bg-gray-700 text-white",
  other: "bg-indigo-700 text-white",
};

const DisputesSupportPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<"disputes" | "tickets" | "feedback">("disputes");
  const { settings, formatPrice, t } = useSettings();

  // Feedback state
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  // Disputes state
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedDisputes, setSelectedDisputes] = useState<string[]>([]);

  // Tickets state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    rating: "",
    dateRange: "",
    category: "",
    priority: "",
    hasComment: "",
    minRating: "",
    maxRating: "",
    vehicleId: "",
    customerId: "",
    ownerId: ""
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // ==================== FEEDBACK ENDPOINTS ====================

  // Fetch feedback data using /feedback/filtered endpoint
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      // Add all filters
      if (filters.status) params.append('status', filters.status);
      if (filters.rating) params.append('minRating', filters.rating);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxRating) params.append('maxRating', filters.maxRating);
      if (filters.hasComment) params.append('hasComment', filters.hasComment);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);
      if (searchTerm) params.append('search', searchTerm);

      // Date range filtering
      if (filters.dateRange) {
        const now = new Date();
        let dateFrom = '';

        switch (filters.dateRange) {
          case 'today':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            break;
          case 'week':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            break;
          case 'month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            break;
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            dateFrom = quarterStart.toISOString();
            break;
        }

        if (dateFrom) {
          params.append('dateFrom', dateFrom);
        }
      }

      console.log('🔍 Fetching feedback with params:', params.toString());

      const response = await apiClient.get(`/feedback/filtered?${params}`);

      if (response.success) {
        const data = response.data as { feedback?: Feedback[]; pagination?: { totalFeedback?: number; totalPages?: number } };
        const feedbackData = data.feedback || [];
        setFeedback(feedbackData);

        if (data.pagination && typeof data.pagination === "object") {
          setPagination(prev => ({
            ...prev,
            total: data.pagination?.totalFeedback ?? 0,
            totalPages: data.pagination?.totalPages ?? 0
          }));
        }

        console.log('✅ Feedback fetched:', feedbackData.length, 'items');
      } else {
        setError('Failed to fetch feedback data');
      }
    } catch (error: any) {
      console.error('❌ Error fetching feedback:', error);
      setError(error.message || 'Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics using /feedback/analytics endpoint
  const fetchAnalytics = async () => {
    try {
      console.log('🔍 Fetching feedback analytics...');

      const params = new URLSearchParams();
      if (filters.dateRange) {
        const dayMap: Record<string, string> = {
          'today': '1',
          'week': '7',
          'month': '30',
          'quarter': '90'
        };
        params.append('timeframe', dayMap[filters.dateRange] || '30');
      }
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);

      const response = await apiClient.get(`/feedback/analytics?${params}`);

      if (response.success) {
        setFeedbackAnalytics(response.data as FeedbackAnalytics);
        console.log('✅ Analytics fetched successfully');
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
    }
  };

  // Bulk feedback actions using /feedback/bulk-action endpoint
  const handleBulkFeedbackAction = async (action: 'approve' | 'flag' | 'delete', feedbackIds: string[]) => {
    try {
      setLoading(true);
      console.log(`📝 Performing bulk ${action} on ${feedbackIds.length} feedback items`);

      const response = await apiClient.post('/feedback/bulk-action', {
        action,
        feedbackIds,
        reason: `Admin bulk ${action} operation`
      });

      if (response.success) {
        console.log('✅ Bulk action completed successfully');
        await fetchFeedback();
        if (tab === 'feedback') await fetchAnalytics();
        setSelectedFeedback([]);
        alert(`Successfully ${action}d ${feedbackIds.length} feedback items`);
      } else {
        console.error('❌ Bulk action failed:', response.message);
        alert('Failed to perform bulk action');
      }
    } catch (error: any) {
      console.error('❌ Error performing bulk action:', error);
      alert(error.message || 'Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  // Send reminder using /feedback/remind/:customerId endpoint
  const handleSendReminder = async (customerId: string) => {
    try {
      console.log('📧 Sending feedback reminder to customer:', customerId);

      const response = await apiClient.post(`/feedback/remind/${customerId}`);

      if (response.success) {
        console.log('✅ Reminder sent successfully');
        const data = response.data as { remindersCount: number; customer: { first_name: string; last_name: string } };
        alert(`Reminder sent successfully! ${data.remindersCount} reminders sent to ${data.customer.first_name} ${data.customer.last_name}`);
      } else {
        alert('Failed to send reminder');
      }
    } catch (error: any) {
      console.error('❌ Error sending reminder:', error);
      alert(error.message || 'Failed to send reminder');
    }
  };

  // Export data using /feedback/export endpoint
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      console.log(`📤 Exporting feedback data as ${format}...`);

      const params = new URLSearchParams();
      params.append('format', format);

      // Add current filters to export
      if (filters.status) params.append('status', filters.status);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxRating) params.append('maxRating', filters.maxRating);
      if (filters.vehicleId) params.append('vehicleId', filters.vehicleId);
      if (filters.ownerId) params.append('ownerId', filters.ownerId);

      // Date range for export
      if (filters.dateRange) {
        const now = new Date();
        let dateFrom = '';

        switch (filters.dateRange) {
          case 'today':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
            break;
          case 'week':
            dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            break;
          case 'quarter':
            const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            dateFrom = quarterStart.toISOString().split('T')[0];
            break;
        }

        if (dateFrom) {
          params.append('dateFrom', dateFrom);
        }
      }

      const token = localStorage.getItem('autofleet_token');
      const response = await fetch(`/api/feedback/export?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Export completed successfully');
        alert(`Feedback data exported successfully as ${format.toUpperCase()}`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  // ==================== DISPUTES ENDPOINTS ====================

  // Mock disputes fetch - replace with actual endpoint when available
  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual disputes endpoint
      // const response = await apiClient.get(`/disputes?${params}`);

      // Mock data for now
      const mockDisputes: Dispute[] = [
        {
          id: "DSP-1034",
          bookingId: "BK-2458",
          customer: {
            id: "1",
            initials: "JK",
            name: "John Kamali",
            email: "john.kamali@example.com"
          },
          owner: {
            id: "2",
            name: "Premium Cars Ltd",
            email: "owner@premiumcars.com"
          },
          issue: "Late delivery of vehicle",
          description: "Vehicle was delivered 2 hours late without prior notice",
          status: "open",
          priority: "high",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setDisputes(mockDisputes);
      setPagination(prev => ({
        ...prev,
        total: mockDisputes.length,
        totalPages: 1
      }));

    } catch (error: any) {
      console.error('❌ Error fetching disputes:', error);
      setError(error.message || 'Failed to fetch disputes data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== TICKETS ENDPOINTS ====================

  // Mock tickets fetch - replace with actual endpoint when available
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual support-tickets endpoint
      // const response = await apiClient.get(`/support-tickets?${params}`);

      // Mock data for now
      const mockTickets: Ticket[] = [
        {
          id: "TKT-4552",
          user: {
            id: "1",
            initials: "JK",
            name: "John Kamali",
            email: "john.kamali@example.com"
          },
          subject: "Payment not reflecting",
          description: "Made payment 2 days ago but it's not showing in my account",
          category: "payment",
          status: "open",
          priority: "medium",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setTickets(mockTickets);
      setPagination(prev => ({
        ...prev,
        total: mockTickets.length,
        totalPages: 1
      }));

    } catch (error: any) {
      console.error('❌ Error fetching tickets:', error);
      setError(error.message || 'Failed to fetch tickets data');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMMON FUNCTIONS ====================

  // Format rating stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
      />
    ));
  };

  // Refresh data
  const refreshData = () => {
    switch (tab) {
      case 'feedback':
        fetchFeedback();
        fetchAnalytics();
        break;
      case 'disputes':
        fetchDisputes();
        break;
      case 'tickets':
        fetchTickets();
        break;
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "",
      rating: "",
      dateRange: "",
      category: "",
      priority: "",
      hasComment: "",
      minRating: "",
      maxRating: "",
      vehicleId: "",
      customerId: "",
      ownerId: ""
    });
    setSearchTerm("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Helper function to generate initials
  const generateInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Effects
  useEffect(() => {
    switch (tab) {
      case 'feedback':
        fetchFeedback();
        fetchAnalytics();
        break;
      case 'disputes':
        fetchDisputes();
        break;
      case 'tickets':
        fetchTickets();
        break;
    }
  }, [tab, filters, searchTerm, pagination.page]);

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedFeedback([]);
    setSelectedDisputes([]);
    setSelectedTickets([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [tab]);

  return (
    <div className="flex min-h-screen bg-gray-50">


      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Disputes & Support Management</h1>
              <p className="text-gray-600">Manage disputes, support tickets, and customer feedback</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        {/* Analytics Cards - Show only for feedback tab */}
        {tab === 'feedback' && feedbackAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.overview.totalFeedback}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.overview.averageRating.toFixed(1)}</p>
                    <div className="flex">{renderStars(Math.round(feedbackAnalytics.overview.averageRating))}</div>
                  </div>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Positive Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.overview.positiveFeedback}</p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Negative Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedbackAnalytics.overview.negativeFeedback}</p>
                </div>
                <Flag className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-white"
            />
          </div>

          {/* Rating Filter (Feedback only) */}
          {tab === 'feedback' && (
            <>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>

              <select
                value={filters.hasComment}
                onChange={(e) => setFilters({ ...filters, hasComment: e.target.value })}
                className="border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">All Comments</option>
                <option value="true">With Comments</option>
                <option value="false">Without Comments</option>
              </select>
            </>
          )}

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">All Status</option>
            {tab === 'feedback' ? (
              <>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </>
            ) : (
              <>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </>
            )}
          </select>

          {/* Category/Priority Filter */}
          {tab === 'feedback' ? (
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="border rounded px-3 py-2 text-sm bg-white"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          ) : (
            <>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">All Categories</option>
                <option value="payment">Payment</option>
                <option value="account">Account</option>
                <option value="vehicle">Vehicle</option>
                <option value="service">Service</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="border rounded px-3 py-2 text-sm bg-white"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </>
          )}

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          {/* Export and Create Actions */}
          <div className="ml-auto flex gap-2">
            {tab === 'feedback' && (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {tab === 'feedback' && selectedFeedback.length > 0 && (
          <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
            <button
              onClick={() => handleBulkFeedbackAction('approve', selectedFeedback)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Approve ({selectedFeedback.length})
            </button>
            <button
              onClick={() => handleBulkFeedbackAction('flag', selectedFeedback)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              <Flag className="w-4 h-4" /> Flag ({selectedFeedback.length})
            </button>
            <button
              onClick={() => handleBulkFeedbackAction('delete', selectedFeedback)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedFeedback.length})
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-4">
          <button
            className={`pb-1 font-semibold border-b-2 ${tab === "disputes"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setTab("disputes")}
          >
            Complaints / Disputes ({disputes.length})
          </button>
          <button
            className={`pb-1 font-semibold border-b-2 ${tab === "tickets"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setTab("tickets")}
          >
            Support Tickets ({tickets.length})
          </button>
          <button
            className={`pb-1 font-semibold border-b-2 ${tab === "feedback"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setTab("feedback")}
          >
            Customer Feedback ({feedback.length})
          </button>
        </div>

        {/* Tab Content */}
        {tab === "feedback" ? (
          // Feedback Tab
          <div className="bg-white rounded-xl shadow p-0 border border-gray-300">
            <div className="font-semibold px-6 py-3 border-b text-gray-700 flex items-center justify-between">
              <span>Customer Feedback Management</span>
              {loading && <div className="text-sm text-blue-600">Loading...</div>}
            </div>

            {feedback.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {loading ? 'Loading feedback...' : 'No feedback found matching your criteria'}
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedFeedback.length === feedback.length && feedback.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFeedback(feedback.map(f => f.id));
                          } else {
                            setSelectedFeedback([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehicle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ratings</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Comment</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Booking</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((f) => (
                    <tr key={f.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedFeedback.includes(f.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeedback([...selectedFeedback, f.id]);
                            } else {
                              setSelectedFeedback(selectedFeedback.filter(id => id !== f.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs">
                            {generateInitials(f.customer_first_name, f.customer_last_name)}
                          </span>
                          <div>
                            <div className="font-medium">{f.customer_first_name} {f.customer_last_name}</div>
                            <div className="text-gray-500 text-xs">{f.customer_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{f.make} {f.model} {f.year}</div>
                          <div className="text-gray-500 text-xs">{f.license_plate}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Overall:</span>
                            {renderStars(f.rating)}
                            <span className="text-xs font-medium">{f.rating}/5</span>
                          </div>
                          {f.service_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Service:</span>
                              {renderStars(f.service_rating)}
                              <span className="text-xs">{f.service_rating}/5</span>
                            </div>
                          )}
                          {f.vehicle_condition_rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Condition:</span>
                              {renderStars(f.vehicle_condition_rating)}
                              <span className="text-xs">{f.vehicle_condition_rating}/5</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        {f.comment ? (
                          <p className="truncate text-gray-700" title={f.comment}>
                            {f.comment}
                          </p>
                        ) : (
                          <span className="text-gray-400 italic">No comment</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-xs">#{f.booking_id}</div>
                          <div className="text-gray-500 text-xs">
                            {new Date(f.start_date).toLocaleDateString()} - {new Date(f.end_date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500 text-xs">${f.total_amount}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            className="bg-gray-100 hover:bg-blue-100 text-blue-700 p-1 rounded text-xs"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendReminder(f.customer_id)}
                            className="bg-gray-100 hover:bg-green-100 text-green-700 p-1 rounded text-xs"
                            title="Send Reminder"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBulkFeedbackAction('approve', [f.id])}
                            className="bg-gray-100 hover:bg-green-100 text-green-700 p-1 rounded text-xs"
                            title="Approve"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleBulkFeedbackAction('flag', [f.id])}
                            className="bg-gray-100 hover:bg-red-100 text-red-700 p-1 rounded text-xs"
                            title="Flag"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : tab === "disputes" ? (
          // Disputes placeholder - will be implemented when backend is ready
          <div className="bg-white rounded-xl shadow p-0 border border-gray-300">
            <div className="font-semibold px-6 py-3 border-b text-gray-700 flex items-center justify-between">
              <span>Active Disputes</span>
              {loading && <div className="text-sm text-blue-600">Loading...</div>}
            </div>
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Disputes management coming soon...</p>
            </div>
          </div>
        ) : (
          // Tickets placeholder - will be implemented when backend is ready
          <div className="bg-white rounded-xl shadow p-0 border border-gray-300">
            <div className="font-semibold px-6 py-3 border-b text-gray-700 flex items-center justify-between">
              <span>Support Tickets</span>
              {loading && <div className="text-sm text-blue-600">Loading...</div>}
            </div>
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Support tickets management coming soon...</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded ${pagination.page === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputesSupportPage;
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  AlertTriangle,
  User,
  Car,
  MapPin,
  CreditCard,
  Mail,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  FileText,
  DollarSign,
} from "lucide-react";
import { useSettings } from '@/contexts/SettingContxt';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png'; // Import your logo

interface Booking {
  id: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  pickup_location: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  vehicle_name: string;
  license_plate: string;
  vehicle_type: string;
  vehicle_images: string[];
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  duration_days?: number;
  date_range?: string;
}

interface BookingStats {
  all_bookings: number;
  pending_approval: number;
  completed_rentals: number;
  canceled_disputed: number;
}

const BookingsManagementPage: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    all_bookings: 0,
    pending_approval: 0,
    completed_rentals: 0,
    canceled_disputed: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState("");
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [pdfExportLoading, setPdfExportLoading] = useState(false);

  // Load user profile from localStorage
  const storedUser = localStorage.getItem('autofleet_user');
  const userProfile = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [currentPage, searchQuery, statusFilter, paymentStatusFilter, dateRangeFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentStatusFilter && { payment_status: paymentStatusFilter }),
        ...(dateRangeFilter && { dateRange: dateRangeFilter })
      });

      const response = await apiClient.get(`/bookings/admin/all?${params}`);
      // cast to any (or a proper typed interface) so we can safely access .data
      const res: any = response;
      if (res && res.success && res.data) {
        setBookings(res.data.bookings || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/bookings/admin/stats/categories');
      // normalize response typing from the api client and guard before updating state
      const res: any = response;
      if (res && res.success && res.data) {
        setStats(res.data as BookingStats);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
      if (response.success) {
        fetchBookings();
        fetchStats();
        return true;
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
    return false;
  };

  const handleBulkStatusUpdate = async () => {
    try {
      const response = await apiClient.put('/bookings/admin/bulk-status', {
        bookingIds: selectedBookings,
        status: bulkStatus
      });

      if (response.success) {
        setSelectedBookings([]);
        setShowBulkModal(false);
        setBulkStatus('');
        fetchBookings();
        fetchStats();
      }
    } catch (error) {
      console.error('Error bulk updating bookings:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        ...(statusFilter && { status: statusFilter }),
        ...(dateRangeFilter && { dateRange: dateRangeFilter })
      });

      if (format === 'csv') {
        // For CSV, we need to handle the download differently
        // Avoid using `process` in browser code to prevent TS errors; allow runtime override on window
        const apiBase = (window as any).REACT_APP_API_URL || (window as any).__REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiBase}/api/bookings/admin/export?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('autofleet_token')}`
          }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bookings-export-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        const response = await apiClient.get(`/bookings/admin/export?${params}`);
        if (response.success) {
          const dataStr = JSON.stringify(response.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `bookings-export-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error exporting bookings:', error);
    }
  };

  // PDF Export Function
  const handlePDFExport = async () => {
    try {
      setPdfExportLoading(true);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date();

      // Get current user info
      const currentUserName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Admin User';
      const currentUserEmail = userProfile?.email || 'admin@example.com';

      // Header with company branding
      doc.setFillColor(44, 62, 125);
      doc.rect(0, 0, pageWidth, 35, 'F');

      // Add logo image
      try {
        doc.addImage(logo, 'PNG', 20, 8, 20, 20);
      } catch (error) {
        console.warn('Logo not loaded, using text instead');
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('🚗 AutoFleet Hub', 20, 18);
      }

      // Company name next to logo
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('AutoFleet Hub', 45, 18);

      // Report title on the right
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Bookings Management Report', pageWidth - 20, 18, { align: 'right' });

      // Subtitle
      doc.setFontSize(10);
      doc.text('Professional Fleet Management System', pageWidth - 20, 26, { align: 'right' });

      // Report Information Section
      let yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Information', 20, yPos);

      // Report details in two columns
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      const reportInfo = [
        ['Report Type:', 'Bookings Management Report'],
        ['Generated By:', currentUserName],
        ['User Email:', currentUserEmail],
        ['Export Date:', currentDate.toLocaleDateString()],
        ['Export Time:', currentDate.toLocaleTimeString()],
        ['Total Records:', bookings.length.toString()],
        ['Status Filter:', statusFilter || 'All Status'],
        ['Payment Filter:', paymentStatusFilter || 'All Payments'],
        ['Date Range:', dateRangeFilter || 'All Time'],
        ['Search Query:', searchQuery || 'None']
      ];

      // Left column
      reportInfo.slice(0, 5).forEach(([label, value], index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos + (index * 6));
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos + (index * 6));
      });

      // Right column
      reportInfo.slice(5).forEach(([label, value], index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 120, yPos + (index * 6));
        doc.setFont('helvetica', 'normal');
        doc.text(value, 170, yPos + (index * 6));
      });

      // Statistics Summary
      yPos += 38;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Statistics Summary', 20, yPos);

      yPos += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      const statsText = `Total: ${stats.all_bookings} | Pending: ${stats.pending_approval} | Completed: ${stats.completed_rentals} | Cancelled/Disputed: ${stats.canceled_disputed}`;
      doc.text(statsText, 20, yPos);

      // Table section
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Booking Details', 20, yPos);

      // Table data
      const tableColumns = ['#', 'Booking ID', 'Customer', 'Vehicle', 'Dates', 'Amount', 'Status', 'Payment'];
      const tableRows = bookings.map((booking, index) => [
        (index + 1).toString(),
        `#${booking.id}`,
        booking.customer_name,
        `${booking.vehicle_name} (${booking.license_plate})`,
        `${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}`,
        formatAmount(booking.total_amount),
        booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)
      ]);

      // Generate table
      autoTable(doc, {
        startY: yPos + 5,
        head: [tableColumns],
        body: tableRows,
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [44, 62, 125],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20, halign: 'right' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' }
        },
        didDrawCell: function (data: any) {
          if (data.column.index === 6 && data.cell.section === 'body') {
            const status = data.cell.text[0].toLowerCase();
            if (status === 'completed') {
              doc.setFillColor(34, 197, 94);
            } else if (status === 'confirmed') {
              doc.setFillColor(59, 130, 246);
            } else if (status === 'active') {
              doc.setFillColor(245, 158, 11);
            } else if (status === 'pending') {
              doc.setFillColor(251, 146, 60);
            } else {
              doc.setFillColor(239, 68, 68);
            }
            doc.setTextColor(255, 255, 255);
          }

          if (data.column.index === 7 && data.cell.section === 'body') {
            const paymentStatus = data.cell.text[0].toLowerCase();
            if (paymentStatus === 'paid') {
              doc.setFillColor(34, 197, 94);
            } else if (paymentStatus === 'pending') {
              doc.setFillColor(245, 158, 11);
            } else {
              doc.setFillColor(239, 68, 68);
            }
            doc.setTextColor(255, 255, 255);
          }
        }
      });

      // Footer
      const pageCount = (doc as any).getNumberOfPages
        ? (doc as any).getNumberOfPages()
        : (doc.internal && typeof (doc.internal as any).getNumberOfPages === 'function'
          ? (doc.internal as any).getNumberOfPages()
          : 1);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        doc.setFillColor(44, 62, 125);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        doc.text('AutoFleet Hub - Fleet Management System', 20, pageHeight - 12);
        doc.text('Confidential Report - Internal Use Only', 20, pageHeight - 6);

        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
        doc.text(`Exported by: ${currentUserName}`, pageWidth - 20, pageHeight - 6, { align: 'right' });
      }

      // Save PDF
      const fileName = `AutoFleet_BookingsReport_${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}_${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}.pdf`;
      doc.save(fileName);

      console.log('Bookings PDF report generated successfully');
      alert('Bookings PDF report exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfExportLoading(false);
    }
  };

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedBookings(prev =>
      prev.length === bookings.length ? [] : bookings.map(b => b.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'cancelled':
      case 'disputed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`flex-1 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bookings Management</h1>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Monitor and manage all vehicle bookings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            >
              <Download className="w-5 h-5" /> Export CSV
            </button>
            <button
              onClick={handlePDFExport}
              disabled={pdfExportLoading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
            >
              <FileText className="w-5 h-5" />
              {pdfExportLoading ? 'Generating...' : 'Export PDF'}
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            >
              <FileText className="w-5 h-5" /> Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>All Bookings</p>
                <p className="text-2xl font-bold">{stats.all_bookings}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pending Approval</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending_approval}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed_rentals}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled/Disputed</p>
                <p className="text-2xl font-bold text-red-600">{stats.canceled_disputed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedBookings.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedBookings.length} bookings selected
              </span>
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${settings.darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bookings List</h3>
              <span className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {bookings.length} bookings found
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={settings.darkMode ? 'bg-gray-750' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {selectedBookings.length === bookings.length && bookings.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Booking Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Vehicle & Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Duration & Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${settings.darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className={`text-gray-500 ${settings.darkMode ? 'text-gray-400' : ''}`}>
                        No bookings found
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className={`hover:${settings.darkMode ? 'bg-gray-750' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleBookingSelection(booking.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {selectedBookings.includes(booking.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                            #{booking.id}
                          </div>
                          <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                            <Calendar className="w-3 h-3" />
                            {booking.date_range || `${formatDate(booking.start_date)} → ${formatDate(booking.end_date)}`}
                          </div>
                          <div className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'} flex items-center gap-1`}>
                            <MapPin className="w-3 h-3" />
                            {booking.pickup_location}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {booking.customer_name}
                            </div>
                            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {booking.customer_email}
                            </div>
                            <div className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {booking.customer_phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-1`}>
                            <Car className="w-3 h-3" />
                            {booking.vehicle_name}
                          </div>
                          <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.license_plate} • {booking.vehicle_type}
                          </div>
                          <div className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Owner: {booking.owner_name}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatAmount(booking.total_amount)}
                          </div>
                          <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.duration_days} days
                          </div>
                          <div className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                            <CreditCard className="w-3 h-3" />
                            {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Status Action Buttons */}
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded"
                              title="Confirm Booking"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'active')}
                              className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-100 rounded"
                              title="Mark as Active"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          {booking.status === 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {['pending', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between px-6 py-4 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${settings.darkMode
                      ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-700 disabled:opacity-50'
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${settings.darkMode
                      ? 'bg-gray-700 border-gray-600 text-white disabled:opacity-50'
                      : 'bg-white border-gray-300 text-gray-700 disabled:opacity-50'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-4xl max-h-90vh overflow-y-auto m-4`}>
            <div className={`px-6 py-4 border-b ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Booking Details #{selectedBooking.id}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className={`p-2 hover:bg-gray-100 rounded ${settings.darkMode ? 'hover:bg-gray-700' : ''}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className={`p-4 border rounded-lg ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedBooking.customer_name}</p>
                    <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.customer_phone}</p>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className={`p-4 border rounded-lg ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Vehicle:</strong> {selectedBooking.vehicle_name}</p>
                    <p><strong>License Plate:</strong> {selectedBooking.license_plate}</p>
                    <p><strong>Type:</strong> {selectedBooking.vehicle_type}</p>
                    <p><strong>Owner:</strong> {selectedBooking.owner_name}</p>
                  </div>
                </div>

                {/* Booking Info */}
                <div className={`p-4 border rounded-lg ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Booking Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Start Date:</strong> {formatDate(selectedBooking.start_date)}</p>
                    <p><strong>End Date:</strong> {formatDate(selectedBooking.end_date)}</p>
                    <p><strong>Duration:</strong> {selectedBooking.duration_days} days</p>
                    <p><strong>Pickup Location:</strong> {selectedBooking.pickup_location}</p>
                  </div>
                </div>

                {/* Payment Info */}
                <div className={`p-4 border rounded-lg ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Payment Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Total Amount:</strong> {formatAmount(selectedBooking.total_amount)}</p>
                    <p><strong>Payment Method:</strong> {selectedBooking.payment_method}</p>
                    <p><strong>Payment Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                        {selectedBooking.payment_status.charAt(0).toUpperCase() + selectedBooking.payment_status.slice(1)}
                      </span>
                    </p>
                    <p><strong>Booking Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedBooking.id, 'confirmed');
                      setShowBookingModal(false);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Booking
                  </button>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedBooking.id, 'active');
                      setShowBookingModal(false);
                    }}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                  >
                    <Clock className="w-4 h-4" />
                    Mark as Active
                  </button>
                )}

                {['pending', 'confirmed'].includes(selectedBooking.status) && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedBooking.id, 'cancelled');
                      setShowBookingModal(false);
                    }}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-90vw`}>
            <h3 className="text-lg font-semibold mb-4">Update Booking Status</h3>
            <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Update status for {selectedBookings.length} selected bookings
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${settings.darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkStatus('');
                }}
                className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 ${settings.darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagementPage;
import React, { useState, useEffect } from "react";
import {
  Car,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Mail,
  FileText,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { useSettings } from '@/contexts/SettingContxt';
import { apiClient } from '@/services/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';
import { useAuth } from '@/contexts/AuthContext';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  license_plate: string;
  color?: string;
  seats?: number;
  transmission?: string;
  fuel_type?: string;
  daily_rate?: number;
  selling_price?: number;
  listing_type: 'rent' | 'sale';
  description?: string;
  features?: string[];
  images?: string[];
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  location_address?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
  owner_email?: string;
  location_lat?: number;
  location_lng?: number;
  locationLat?: number;
  locationLng?: number;
  created_at: string;
  updated_at: string;
}

interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  inactive: number;
}

const VehicleManagementPage: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats>({
    total: 0,
    available: 0,
    rented: 0,
    maintenance: 0,
    inactive: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [bulkStatus, setBulkStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notificationVehicle, setNotificationVehicle] = useState<Vehicle | null>(null);
  const [notificationType, setNotificationType] = useState('');
  const [pdfExportLoading, setPdfExportLoading] = useState(false);

  // Load user profile from localStorage
  const storedUser = localStorage.getItem('autofleet_user');
  const userProfile = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchQuery, statusFilter, typeFilter, listingTypeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(listingTypeFilter && { listing_type: listingTypeFilter })
      });

      type VehiclesResponse = {
        success: boolean;
        data: {
          vehicles?: Vehicle[];
          pagination?: { totalPages?: number };
        };
      };

      const response = await apiClient.get(`/vehicles?${params}`) as unknown as VehiclesResponse;
      if (response && response.success) {
        const vehiclesList = response.data?.vehicles || [];
        setVehicles(vehiclesList);
        setTotalPages(response.data?.pagination?.totalPages || 1);

        // Calculate stats from vehicles data
        const vehiclesData = vehiclesList;
        const newStats = {
          total: vehiclesData.length,
          available: vehiclesData.filter((v: Vehicle) => v.status === 'available').length,
          rented: vehiclesData.filter((v: Vehicle) => v.status === 'rented').length,
          maintenance: vehiclesData.filter((v: Vehicle) => v.status === 'maintenance').length,
          inactive: vehiclesData.filter((v: Vehicle) => v.status === 'inactive').length,
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (vehicleId: string, status: string, reason?: string) => {
    try {
      const response = await apiClient.put(`/vehicles/admin/${vehicleId}/status`, {
        status,
        rejectionReason: reason
      });

      if (response.success) {
        fetchVehicles();
        return true;
      }
    } catch (error) {
      console.error('Error updating vehicle status:', error);
    }
    return false;
  };

  const handleBulkStatusUpdate = async () => {
    try {
      const response = await apiClient.put('/vehicles/admin/bulk-status', {
        vehicleIds: selectedVehicles,
        status: bulkStatus,
        rejectionReason: rejectionReason
      });

      if (response.success) {
        setSelectedVehicles([]);
        setShowBulkStatusModal(false);
        setBulkStatus('');
        setRejectionReason('');
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error bulk updating vehicles:', error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    try {
      const response = await apiClient.delete(`/vehicles/${vehicleToDelete.id}`);
      if (response.success) {
        setShowDeleteModal(false);
        setVehicleToDelete(null);
        fetchVehicles();
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationVehicle) return;

    try {
      const response = await apiClient.post(`/vehicles/${notificationVehicle.id}/notify`, {
        notificationType,
        customMessage: rejectionReason
      });

      if (response.success) {
        setShowNotifyModal(false);
        setNotificationVehicle(null);
        setNotificationType('');
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleExport = async () => {
    try {
      // Add export functionality here
      console.log('Exporting vehicles data...');
    } catch (error) {
      console.error('Error exporting data:', error);
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
      doc.text('Vehicle Management Report', pageWidth - 20, 18, { align: 'right' });

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
        ['Report Type:', 'Vehicle Management Report'],
        ['Generated By:', currentUserName],
        ['User Email:', currentUserEmail],
        ['Export Date:', currentDate.toLocaleDateString()],
        ['Export Time:', currentDate.toLocaleTimeString()],
        ['Total Records:', vehicles.length.toString()],
        ['Status Filter:', statusFilter || 'All Status'],
        ['Type Filter:', typeFilter || 'All Types'],
        ['Listing Filter:', listingTypeFilter || 'All Listings'],
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

      const statsText = `Total: ${stats.total} | Available: ${stats.available} | Rented: ${stats.rented} | Maintenance: ${stats.maintenance} | Inactive: ${stats.inactive}`;
      doc.text(statsText, 20, yPos);

      // Table section
      yPos += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Vehicle Details', 20, yPos);

      // Table data
      const tableColumns = ['#', 'Vehicle', 'Owner', 'Type', 'Price', 'Status', 'Listing'];
      const tableRows = vehicles.map((vehicle, index) => [
        (index + 1).toString(),
        `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
        `${vehicle.owner_first_name} ${vehicle.owner_last_name}`,
        vehicle.type,
        vehicle.listing_type === 'sale'
          ? `RWF ${vehicle.selling_price?.toLocaleString() || 0}`
          : `RWF ${vehicle.daily_rate?.toLocaleString() || 0}/day`,
        vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1),
        vehicle.listing_type === 'sale' ? 'For Sale' : 'For Rent'
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
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 25, halign: 'center' }
        },
        didDrawCell: function (data: any) {
          if (data.column.index === 5 && data.cell.section === 'body') {
            const status = data.cell.text[0].toLowerCase();
            if (status === 'available') {
              doc.setFillColor(34, 197, 94);
            } else if (status === 'rented') {
              doc.setFillColor(59, 130, 246);
            } else if (status === 'maintenance') {
              doc.setFillColor(245, 158, 11);
            } else {
              doc.setFillColor(239, 68, 68);
            }
            doc.setTextColor(255, 255, 255);
          }

          if (data.column.index === 6 && data.cell.section === 'body') {
            const listingType = data.cell.text[0].toLowerCase();
            if (listingType.includes('sale')) {
              doc.setFillColor(147, 51, 234);
            } else {
              doc.setFillColor(34, 197, 94);
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
      const fileName = `AutoFleet_VehiclesReport_${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}_${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}.pdf`;
      doc.save(fileName);

      console.log('Vehicles PDF report generated successfully');
      alert('Vehicles PDF report exported successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setPdfExportLoading(false);
    }
  };

  const toggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedVehicles(prev =>
      prev.length === vehicles.length ? [] : vehicles.map(v => v.id)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (img: string | null | undefined) => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    // Always ensure a single leading slash
    const normalizedImg = img.startsWith("/") ? img : `/${img}`;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');
    return `${STATIC_BASE_URL}${normalizedImg}`;
  };

  const parseVehicleImages = (images: any) => {
    let parsedImages: string[] = [];
    try {
      if (Array.isArray(images)) {
        parsedImages = images;
      } else if (images && typeof images === 'string' && images.trim() !== '') {
        parsedImages = JSON.parse(images);
      }
    } catch {
      parsedImages = [];
    }
    return parsedImages;
  };

  // Update the header section to include PDF export button
  return (
    <div className={`flex-1 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vehicle Management</h1>
            <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Manage and monitor all vehicles in the fleet
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Vehicle Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rented</p>
                <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
            </div>
          </div>

          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
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
                placeholder="Search vehicles by make, model, or plate number..."
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
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="">All Types</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>

            <select
              value={listingTypeFilter}
              onChange={(e) => setListingTypeFilter(e.target.value)}
              className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="">All Listings</option>
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedVehicles.length > 0 && (
            <div className="mt-4 flex items-center gap-3">
              <span className={`text-sm font-medium ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedVehicles.length} vehicles selected
              </span>
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
            </div>
          )}
        </div>

        {/* Vehicles Table */}
        <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className={`px-6 py-4 border-b ${settings.darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vehicle List</h3>
              <span className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {vehicles.length} vehicles found
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
                      {selectedVehicles.length === vehicles.length && vehicles.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Vehicle
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Owner
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${settings.darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                    Price
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading vehicles...</span>
                      </div>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className={`text-gray-500 ${settings.darkMode ? 'text-gray-400' : ''}`}>
                        No vehicles found
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className={`hover:${settings.darkMode ? 'bg-gray-750' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleVehicleSelection(vehicle.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {selectedVehicles.includes(vehicle.id) ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 h-12 bg-gray-300 rounded-lg mr-4 overflow-hidden">
                            {(() => {
                              const images = parseVehicleImages(vehicle.images);
                              const firstImage = images && images.length > 0 ? images[0] : null;
                              const imageUrl = getImageUrl(firstImage);
                              return (
                                <img
                                  src={imageUrl}
                                  alt={`${vehicle.make} ${vehicle.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.png';
                                  }}
                                />
                              );
                            })()}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {vehicle.make} {vehicle.model} {vehicle.year}
                            </div>
                            <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {vehicle.license_plate} • {vehicle.type}
                            </div>
                            <div className={`text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {vehicle.listing_type === 'sale' ? 'For Sale' : 'For Rent'}
                            </div>
                            {/* GPS Navigation Button */}
                            <button
                              className="mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="Navigate to Vehicle Location"
                              onClick={() => {
                                // Use locationLat/locationLng if present, else fallback to location_lat/location_lng
                                const lat = vehicle.locationLat || vehicle.location_lat;
                                const lng = vehicle.locationLng || vehicle.location_lng;
                                if (lat && lng) {
                                  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                  window.open(url, '_blank');
                                } else {
                                  alert('No coordinates available for this vehicle.');
                                }
                              }}
                            >
                              GPS Navigate
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {vehicle.owner_first_name} {vehicle.owner_last_name}
                        </div>
                        <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {vehicle.owner_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {vehicle.listing_type === 'sale'
                            ? `RWF ${vehicle.selling_price?.toLocaleString()}`
                            : `RWF ${vehicle.daily_rate?.toLocaleString()}/day`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => console.log('View vehicle', vehicle.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Status Update Buttons */}
                          {vehicle.status === 'inactive' && (
                            <button
                              onClick={() => handleStatusUpdate(vehicle.id, 'available')}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded"
                              title="Approve Vehicle"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {vehicle.status === 'available' && (
                            <button
                              onClick={() => handleStatusUpdate(vehicle.id, 'maintenance')}
                              className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-100 rounded"
                              title="Mark as Maintenance"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setNotificationVehicle(vehicle);
                              setShowNotifyModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-100 rounded"
                            title="Send Notification"
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setVehicleToDelete(vehicle);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                            title="Delete Vehicle"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-90vw`}>
            <h3 className="text-lg font-semibold mb-4">Delete Vehicle</h3>
            <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to delete {vehicleToDelete.make} {vehicleToDelete.model}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 ${settings.darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-90vw`}>
            <h3 className="text-lg font-semibold mb-4">Update Vehicle Status</h3>
            <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Update status for {selectedVehicles.length} selected vehicles
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
                <option value="available">Available</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {(bulkStatus === 'inactive' || bulkStatus === 'maintenance') && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for status change..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${settings.darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBulkStatusModal(false);
                  setBulkStatus('');
                  setRejectionReason('');
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

      {/* Send Notification Modal */}
      {showNotifyModal && notificationVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${settings.darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-96 max-w-90vw`}>
            <h3 className="text-lg font-semibold mb-4">Send Notification</h3>
            <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
              Send notification for {notificationVehicle.make} {notificationVehicle.model}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Notification Type</label>
              <select
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${settings.darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                  }`}
              >
                <option value="">Select Type</option>
                <option value="approved">Approval Notification</option>
                <option value="rejected">Rejection Notification</option>
              </select>
            </div>

            {notificationType === 'rejected' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Custom Message</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter custom message..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${settings.darkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                  setNotificationVehicle(null);
                  setNotificationType('');
                  setRejectionReason('');
                }}
                className={`flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 ${settings.darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={!notificationType}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagementPage;


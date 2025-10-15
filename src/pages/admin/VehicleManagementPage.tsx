import React, { useState, useEffect } from "react";
import {
  BarChart2,
  ClipboardList,
  Car,
  Users,
  User,
  LogOut,
  FileText,
  Settings,
  Bell,
  UserPlus,
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  PlusCircle,
  Download,
  CheckSquare,
  Square,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "@/contexts/SettingContxt";
import { apiClient } from '@/services/apiClient';

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

interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  category: string;
  status: string;
  availability_status: string;
  price_per_day: number;
  owner_name: string;
  owner_email: string;
  images?: string[];
  created_at: string;
}

interface VehicleStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  available: number;
  unavailable: number;
}

const VehicleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();

  // Safe price formatting function
  const safeFormatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return 'N/A';
    }
    try {
      return formatPrice(Number(price));
    } catch (error) {
      console.error('Error formatting price:', error);
      return `$${Number(price).toFixed(2)}`;
    }
  };

  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    available: 0,
    unavailable: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "categories">("all");
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Status colors
  const statusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
    available: "bg-blue-100 text-blue-700",
    unavailable: "bg-gray-100 text-gray-700",
  };

  // Fetch vehicles with filters
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      let endpoint = '/vehicles/admin/all';
      
      // If on pending tab, use specific endpoint
      if (activeTab === 'pending') {
        endpoint = '/vehicles/admin/by-status/pending';
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      console.log('Fetching vehicles with params:', params.toString());
      const response = await apiClient.get(`${endpoint}?${params}`);
      console.log('Vehicles API Response:', response);
      
      if (response.success && response.data) {
        let vehiclesData = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          vehiclesData = response.data;
          setTotalPages(Math.ceil(response.data.length / 10));
        } else if (
          typeof response.data === "object" &&
          response.data !== null &&
          "vehicles" in response.data
        ) {
          vehiclesData = (response.data as { vehicles: Vehicle[] }).vehicles;
          setTotalPages((response.data as any).pagination?.totalPages || 1);
        } else if (
          typeof response.data === "object" &&
          response.data !== null &&
          "data" in response.data
        ) {
          vehiclesData = (response.data as { data: Vehicle[] }).data;
          setTotalPages((response.data as any).pagination?.totalPages || 1);
        }
        
        console.log('Vehicles data:', vehiclesData);
        setVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Define the expected backend stats structure
  type BackendVehicleStats = {
    all_vehicles?: number;
    approved?: number;
    pending_approval?: number;
    removed?: number;
  };
  
  // Fetch vehicle stats - Fixed to match backend response
  const fetchVehicleStats = async () => {
    try {
      console.log('Fetching vehicle stats...');
      const response = await apiClient.get('/vehicles/admin/stats/approval');
      console.log('Vehicle stats API response:', response);
      
      if (response.success && response.data) {
        let statsData: BackendVehicleStats = response.data;
        
        // Handle nested data structure
        if (typeof response.data === "object" && response.data !== null && "data" in response.data) {
          statsData = (response.data as { data: BackendVehicleStats }).data;
          console.log('Using nested data:', statsData);
        }
        
        console.log('Final stats data:', statsData);
        
        // Map backend property names to frontend expected names
        const mappedStats = {
          total: statsData.all_vehicles || 0,
          approved: statsData.approved || 0,
          pending: statsData.pending_approval || 0,
          rejected: statsData.removed || 0,
          available: statsData.approved || 0, // Using approved as available for now
          unavailable: (statsData.all_vehicles || 0) - (statsData.approved || 0),
        };
        
        console.log('Mapped vehicle stats:', mappedStats);
        setVehicleStats(mappedStats);
        
      } else {
        console.warn('Stats API failed or returned no data, using fallback');
        calculateStatsFromVehicles();
      }
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      calculateStatsFromVehicles();
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedVehicles.length === 0) {
      alert('Please select vehicles to update');
      return;
    }

    try {
      setBulkActionLoading(true);
      const response = await apiClient.put('/vehicles/admin/bulk-status', {
        vehicleIds: selectedVehicles,
        status: newStatus
      });

      if (response.success) {
        await fetchVehicles();
        await fetchVehicleStats();
        setSelectedVehicles([]);
        alert('Vehicles updated successfully');
      } else {
        alert('Failed to update vehicles');
      }
    } catch (error) {
      console.error('Error updating vehicles:', error);
      alert('Error updating vehicles');
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
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetch(`/api/vehicles/admin/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Toggle vehicle selection
  const toggleVehicleSelection = (vehicleId: number) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  // Select all vehicles
  const toggleSelectAll = () => {
    if (selectedVehicles.length === vehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(vehicles.map(v => v.id));
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchQuery, categoryFilter, statusFilter, activeTab]);

  useEffect(() => {
    fetchVehicleStats();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchVehicles();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Reset filters when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setSelectedVehicles([]);
  }, [activeTab]);

  if (loading && vehicles.length === 0) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
            Loading vehicles...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
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
        {/* Top search bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search ..."
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring w-80 bg-white shadow-sm text-gray-900"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-white p-2 rounded-full shadow">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
              <span className="text-gray-700">EN</span> <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Vehicle Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats.total}</p>
              </div>
              <Car className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats.approved}</p>
              </div>
              <Shield className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats.pending}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Available</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleStats.available}</p>
              </div>
              <Car className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Vehicle Management Title and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg text-gray-700">Vehicle Management</div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
            >
              <Download className="w-5 h-5" /> 
              {exportLoading ? 'Exporting...' : 'Export CSV'}
            </button>
            <button 
              onClick={() => navigate('/admin/vehicles/add')}
              className="flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              <PlusCircle className="w-5 h-5" /> Add New Vehicle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 bg-white w-80 shadow-sm">
            <Search className="w-5 h-5 text-gray-600 mr-3" />
            <input
              type="text"
              placeholder="Search by vehicle name or plate"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-gray-900 placeholder-gray-600 font-medium"
            />
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm min-w-[160px] font-medium"
          >
            <option value="" className="text-gray-900 font-medium">All Categories</option>
            <option value="suv" className="text-gray-900 font-medium">SUV</option>
            <option value="sedan" className="text-gray-900 font-medium">Sedan</option>
            <option value="hatchback" className="text-gray-900 font-medium">Hatchback</option>
            <option value="pickup" className="text-gray-900 font-medium">Pickup</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm min-w-[140px] font-medium"
          >
            <option value="" className="text-gray-900 font-medium">All Status</option>
            <option value="approved" className="text-gray-900 font-medium">Approved</option>
            <option value="pending" className="text-gray-900 font-medium">Pending</option>
            <option value="rejected" className="text-gray-900 font-medium">Rejected</option>
          </select>

          {/* Bulk Actions */}
          {selectedVehicles.length > 0 && (
            <div className="flex items-center gap-3">
              <select 
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                className="border-2 border-gray-300 rounded-lg px-4 py-3 text-sm bg-white text-gray-900 shadow-sm font-medium"
                disabled={bulkActionLoading}
              >
                <option value="" className="text-gray-900 font-medium">Bulk Actions</option>
                <option value="approved" className="text-gray-900 font-medium">Approve</option>
                <option value="pending" className="text-gray-900 font-medium">Mark Pending</option>
                <option value="rejected" className="text-gray-900 font-medium">Reject</option>
                <option value="available" className="text-gray-900 font-medium">Make Available</option>
                <option value="unavailable" className="text-gray-900 font-medium">Make Unavailable</option>
              </select>
              <span className="text-sm text-gray-700 font-semibold bg-blue-100 px-3 py-2 rounded-lg">
                {selectedVehicles.length} selected
              </span>
            </div>
          )}
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
            All Vehicles 
            <span className="bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full font-bold">
              {vehicleStats.total}
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
              {vehicleStats.pending}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`pb-3 font-bold transition-all ${
              activeTab === 'categories' 
                ? 'border-b-3 border-blue-600 text-blue-600' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Categories
          </button>
        </div>

        {/* Vehicles Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button onClick={toggleSelectAll} className="hover:bg-gray-100 p-1 rounded">
                      {selectedVehicles.length === vehicles.length && vehicles.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">VEHICLE</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">CATEGORY</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">OWNER</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">PRICE/DAY</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">AVAILABILITY</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-800 text-sm uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">Loading vehicles...</div>
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="text-gray-500 text-lg font-medium">No vehicles found</div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleVehicleSelection(vehicle.id)}
                          className="hover:bg-gray-100 p-1 rounded"
                        >
                          {selectedVehicles.includes(vehicle.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {vehicle.images && vehicle.images.length > 0 ? (
                            <img 
                              src={vehicle.images[0]} 
                              alt={vehicle.name} 
                              className="w-16 h-12 rounded-lg object-cover border border-gray-200" 
                            />
                          ) : (
                            <div className="w-16 h-12 rounded-lg bg-gray-200 flex items-center justify-center border">
                              <Car className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-base">
                              {vehicle.name || `${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">{vehicle.plate_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 text-base capitalize">{vehicle.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">{vehicle.owner_name}</div>
                        <div className="text-sm text-gray-600 font-medium">{vehicle.owner_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 text-base">
                          {safeFormatPrice(vehicle.price_per_day)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                          statusColor[vehicle.status] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                          statusColor[vehicle.availability_status] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {vehicle.availability_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-3 rounded-lg transition-colors"
                            title="Edit vehicle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this vehicle?')) {
                                // Handle delete vehicle
                              }
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-3 rounded-lg transition-colors"
                            title="Delete vehicle"
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
            <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-t">
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
          )}
        </div>
      </div>
    </div>
  );
};


export default VehicleManagementPage;



function calculateStatsFromVehicles() {
  throw new Error("Function not implemented.");
}


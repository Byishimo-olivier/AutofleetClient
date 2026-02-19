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
  PieChart,
  MessageCircle,
  Shield,
  Sliders,
  AlertCircle,
  Download,
  Star,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { useSettings } from '@/contexts/SettingContxt';
import { apiClient } from '@/services/apiClient';
import AdminLayout from "@/components/layout/AdminLayout";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '@/assets/logo.png';


interface DashboardStats {
  totalRentals: number;
  totalRevenue: number;
  fleetUtilization: number;
  averageRating: number;
  rentalChange: string;
  revenueChange: string;
  utilizationChange: string;
  ratingChange: string;
}

interface RentalTrend {
  day: string;
  date: string;
  rentals: number;
}

interface FleetUtilization {
  category: string;
  utilization: number;
  totalVehicles: number;
  activeVehicles: number;
}

interface RevenueCategory {
  category: string;
  revenue: number;
  bookings: number;
}

interface PaymentMethod {
  method: string;
  percentage: number;
  amount: number;
}

interface Owner {
  id: number;
  name: string;
  email: string;
}

const chartColors = ['#2563eb', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316'];

const ReportsAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatPrice, t } = useSettings();

  // State management
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRentals: 0,
    totalRevenue: 0,
    fleetUtilization: 0,
    averageRating: 0,
    rentalChange: '+0%',
    revenueChange: '+0%',
    utilizationChange: '+0%',
    ratingChange: '+0%',
  });

  const [rentalTrends, setRentalTrends] = useState<RentalTrend[]>([]);
  const [fleetUtilization, setFleetUtilization] = useState<FleetUtilization[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueCategory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [trendsTimeframe, setTrendsTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [exportLoading, setExportLoading] = useState(false);

  // Add state for vehicles data to calculate fallback stats
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  // Safe price formatting function
  const safeFormatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(Number(price))) {
      return '₣0';
    }
    try {
      return formatPrice(Number(price));
    } catch (error) {
      console.error('Error formatting price:', error);
      return `₣${Number(price).toLocaleString()}`;
    }
  };

  // Safe number formatting function
  const safeFormatNumber = (value: any, decimals: number = 1): string => {
    const num = Number(value);
    if (isNaN(num)) {
      return '0' + (decimals > 0 ? '.' + '0'.repeat(decimals) : '');
    }
    return num.toFixed(decimals);
  };

  // Safe percentage formatting
  const safeFormatPercentage = (value: any): string => {
    const num = Number(value);
    if (isNaN(num)) {
      return '0.0%';
    }
    return `${num.toFixed(1)}%`;
  };

  // Fetch vehicles for stats calculation
  const fetchVehiclesForStats = async () => {
    try {
      console.log('Fetching vehicles for stats calculation...');
      const response = await apiClient.get('/vehicles/admin/all?limit=1000');
      console.log('Vehicles for stats response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const vehiclesList = Array.isArray(data) ? data : data.vehicles || [];
        setVehicles(vehiclesList);
        return vehiclesList;
      }
      return [];
    } catch (error) {
      console.error('Error fetching vehicles for stats:', error);
      return [];
    }
  };

  // Fetch bookings for stats calculation
  const fetchBookingsForStats = async () => {
    try {
      console.log('Fetching bookings for stats calculation...');
      const response = await apiClient.get('/bookings/admin/all?limit=1000');
      console.log('Bookings for stats response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const bookingsList = Array.isArray(data) ? data : data.bookings || [];
        setBookings(bookingsList);
        return bookingsList;
      }
      return [];
    } catch (error) {
      console.error('Error fetching bookings for stats:', error);
      return [];
    }
  };

  // Calculate fallback stats from actual data
  const calculateFallbackStats = (vehiclesList: any[], bookingsList: any[]) => {
    console.log('Calculating fallback stats from data...');
    console.log('Vehicles count:', vehiclesList.length);
    console.log('Bookings count:', bookingsList.length);

    // Calculate total rentals
    const totalRentals = bookingsList.length;

    // Calculate total revenue
    const totalRevenue = bookingsList.reduce((sum, booking) => {
      const amount = Number(booking.total_amount || booking.amount || booking.price || 0);
      return sum + amount;
    }, 0);

    // Calculate fleet utilization (approved vehicles / total vehicles)
    const approvedVehicles = vehiclesList.filter(v => v.status === 'approved').length;
    const fleetUtilization = vehiclesList.length > 0 ? (approvedVehicles / vehiclesList.length) * 100 : 0;

    // Calculate average rating from bookings or vehicles
    const ratingsFromBookings = bookingsList
      .map(b => Number(b.rating || 0))
      .filter(r => r > 0);

    const averageRating = ratingsFromBookings.length > 0
      ? ratingsFromBookings.reduce((sum, rating) => sum + rating, 0) / ratingsFromBookings.length
      : 4.5; // Default rating if no ratings found

    const fallbackStats = {
      totalRentals,
      totalRevenue,
      fleetUtilization,
      averageRating,
      rentalChange: '+0%', // Would need historical data to calculate
      revenueChange: '+0%',
      utilizationChange: '+0%',
      ratingChange: '+0%',
    };

    console.log('Calculated fallback stats:', fallbackStats);
    return fallbackStats;
  };

  // Enhanced fetch dashboard stats with fallback
  const fetchDashboardStats = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedOwner && { owner_id: selectedOwner }),
      });

      console.log('Fetching dashboard stats with params:', params.toString());
      const response = await apiClient.get(`/reports/dashboard/stats?${params}`);
      console.log('Dashboard stats response:', response);

      if (response.success && response.data) {
        const data = response.data && typeof response.data === 'object' && 'data' in response.data
          ? (response.data as { data: any }).data
          : response.data;

        console.log('Dashboard stats data structure:', data);

        // FIXED: Handle nested object structure from backend
        let totalRentals = 0;
        let totalRevenue = 0;
        let fleetUtilization = 0;
        let averageRating = 0;

        // Handle the nested structure your backend is returning
        if (data.total_rentals && typeof data.total_rentals === 'object') {
          totalRentals = Number(data.total_rentals.value || data.total_rentals.count || 0);
        } else {
          totalRentals = Number(data.totalRentals || data.total_rentals || 0);
        }

        if (data.total_revenue && typeof data.total_revenue === 'object') {
          totalRevenue = Number(data.total_revenue.value || data.total_revenue.amount || 0);
        } else {
          totalRevenue = Number(data.totalRevenue || data.total_revenue || 0);
        }

        if (data.fleet_utilization && typeof data.fleet_utilization === 'object') {
          fleetUtilization = Number(data.fleet_utilization.value || data.fleet_utilization.percentage || 0);
        } else {
          fleetUtilization = Number(data.fleetUtilization || data.fleet_utilization || 0);
        }

        if (data.average_rating && typeof data.average_rating === 'object') {
          averageRating = Number(data.average_rating.value || data.average_rating.rating || 0);
        } else {
          averageRating = Number(data.averageRating || data.average_rating || 0);
        }

        const stats = {
          totalRentals,
          totalRevenue,
          fleetUtilization,
          averageRating,
          rentalChange: String(data.rentalChange || data.rental_change || '+0%'),
          revenueChange: String(data.revenueChange || data.revenue_change || '+0%'),
          utilizationChange: String(data.utilizationChange || data.utilization_change || '+0%'),
          ratingChange: String(data.ratingChange || data.rating_change || '+0%'),
        };

        console.log('Processed dashboard stats:', stats);

        // If all stats are 0 or NaN, use fallback calculation
        if (isNaN(stats.totalRentals) || (stats.totalRentals === 0 && stats.totalRevenue === 0 && stats.fleetUtilization === 0)) {
          console.log('API stats are invalid/0, using fallback calculation...');
          const vehiclesList = await fetchVehiclesForStats();
          const bookingsList = await fetchBookingsForStats();
          const fallbackStats = calculateFallbackStats(vehiclesList, bookingsList);
          setDashboardStats(fallbackStats);
        } else {
          setDashboardStats(stats);
        }
      } else {
        console.log('API response failed, using fallback calculation...');
        const vehiclesList = await fetchVehiclesForStats();
        const bookingsList = await fetchBookingsForStats();
        const fallbackStats = calculateFallbackStats(vehiclesList, bookingsList);
        setDashboardStats(fallbackStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      console.log('API error, using fallback calculation...');
      const vehiclesList = await fetchVehiclesForStats();
      const bookingsList = await fetchBookingsForStats();
      const fallbackStats = calculateFallbackStats(vehiclesList, bookingsList);
      setDashboardStats(fallbackStats);
    }
  };

  // Generate fallback rental trends from bookings data
  const generateFallbackRentalTrends = (bookingsList: any[], timeframe: 'daily' | 'weekly' | 'monthly') => {
    const days = timeframe === 'daily' ? 7 : timeframe === 'weekly' ? 4 : 12;
    const trendsData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      let label = '';
      if (timeframe === 'daily') {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeframe === 'weekly') {
        label = `Week ${days - i}`;
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short' });
      }

      // Count bookings for this date
      const dateStr = date.toISOString().split('T')[0];
      const bookingsOnDate = bookingsList.filter(booking => {
        const bookingDate = new Date(booking.created_at || booking.booking_date || booking.start_date);
        return bookingDate.toISOString().split('T')[0] === dateStr;
      }).length;

      trendsData.push({
        day: label,
        date: dateStr,
        rentals: bookingsOnDate
      });
    }

    return trendsData;
  };

  // Enhanced fetch rental trends with fallback
  const fetchRentalTrends = async () => {
    try {
      const days = trendsTimeframe === 'daily' ? 7 : trendsTimeframe === 'weekly' ? 4 : 12;
      const params = new URLSearchParams({
        period: trendsTimeframe,
        days: days.toString(),
        ...(selectedOwner && { owner_id: selectedOwner }),
      });

      console.log('Fetching rental trends with params:', params.toString());
      const response = await apiClient.get(`/reports/trends/rentals?${params}`);
      console.log('Rental trends response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const trends = Array.isArray(data) ? data : data.trends || [];

        if (trends.length > 0) {
          setRentalTrends(trends.map((item: any, index: number) => ({
            day: item.day || item.label || item.period || `Day ${index + 1}`,
            date: item.date || item.created_at || '',
            rentals: item.rentals || item.count || item.bookings || 0,
          })));
        } else {
          // Use fallback data based on actual bookings
          console.log('No trends data from API, generating from bookings...');
          const fallbackTrends = generateFallbackRentalTrends(bookings, trendsTimeframe);
          setRentalTrends(fallbackTrends);
        }
      } else {
        // Use fallback data
        console.log('API failed, generating trends from bookings...');
        const fallbackTrends = generateFallbackRentalTrends(bookings, trendsTimeframe);
        setRentalTrends(fallbackTrends);
      }
    } catch (error) {
      console.error('Error fetching rental trends:', error);
      // Use fallback data
      const fallbackTrends = generateFallbackRentalTrends(bookings, trendsTimeframe);
      setRentalTrends(fallbackTrends);
    }
  };

  // Enhanced fleet utilization with fallback
  const fetchFleetUtilization = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedOwner && { owner_id: selectedOwner }),
      });

      console.log('Fetching fleet utilization...');
      const response = await apiClient.get(`/reports/fleet/utilization?${params}`);
      console.log('Fleet utilization response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const utilization = Array.isArray(data) ? data : data.utilization || [];

        if (utilization.length > 0) {
          setFleetUtilization(utilization.map((item: any) => ({
            category: item.category || item.name || item.vehicle_category || '',
            utilization: item.utilization || item.percentage || item.usage_rate || 0,
            totalVehicles: item.totalVehicles || item.total_vehicles || item.total || 0,
            activeVehicles: item.activeVehicles || item.active_vehicles || item.active || 0,
          })));
        } else {
          // Use fallback data based on vehicles
          console.log('No fleet utilization from API, generating from vehicles...');
          const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
          setFleetUtilization(fallbackUtilization);
        }
      } else {
        // Use fallback data
        console.log('API failed, generating fleet utilization from vehicles...');
        const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
        setFleetUtilization(fallbackUtilization);
      }
    } catch (error) {
      console.error('Error fetching fleet utilization:', error);
      // Use fallback data
      const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
      setFleetUtilization(fallbackUtilization);
    }
  };

  // Enhanced revenue by category with fallback
  const fetchRevenueByCategory = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedOwner && { owner_id: selectedOwner }),
      });

      console.log('Fetching revenue by category...');
      const response = await apiClient.get(`/reports/revenue/by-category?${params}`);
      console.log('Revenue by category response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const revenue = Array.isArray(data) ? data : data.categories || [];

        if (revenue.length > 0) {
          setRevenueByCategory(revenue.map((item: any) => ({
            category: item.category || item.name || item.vehicle_category || '',
            revenue: item.revenue || item.amount || item.total_revenue || 0,
            bookings: item.bookings || item.count || item.total_bookings || 0,
          })));
        } else {
          // Use fallback data based on bookings and vehicles
          console.log('No revenue data from API, generating from bookings...');
          const fallbackRevenue = generateFallbackRevenueByCategory(bookings, vehicles);
          setRevenueByCategory(fallbackRevenue);
        }
      } else {
        // Use fallback data
        console.log('API failed, generating revenue data from bookings...');
        const fallbackRevenue = generateFallbackRevenueByCategory(bookings, vehicles);
        setRevenueByCategory(fallbackRevenue);
      }
    } catch (error) {
      console.error('Error fetching revenue by category:', error);
      // Use fallback data
      const fallbackRevenue = generateFallbackRevenueByCategory(bookings, vehicles);
      setRevenueByCategory(fallbackRevenue);
    }
  };

  // Enhanced payment methods with fallback
  const fetchPaymentMethods = async () => {
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedOwner && { owner_id: selectedOwner }),
      });

      console.log('Fetching payment methods...');
      const response = await apiClient.get(`/reports/payments/methods?${params}`);
      console.log('Payment methods response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const methods = Array.isArray(data) ? data : data.methods || [];

        if (methods.length > 0) {
          setPaymentMethods(methods.map((item: any) => ({
            method: item.method || item.name || item.payment_method || '',
            percentage: item.percentage || item.percent || item.usage_percent || 0,
            amount: item.amount || item.total || item.total_amount || 0,
          })));
        } else {
          // Use fallback data based on bookings
          console.log('No payment methods from API, generating from bookings...');
          const fallbackPayments = generateFallbackPaymentMethods(bookings);
          setPaymentMethods(fallbackPayments);
        }
      } else {
        // Use fallback data
        console.log('API failed, generating payment methods from bookings...');
        const fallbackPayments = generateFallbackPaymentMethods(bookings);
        setPaymentMethods(fallbackPayments);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Use fallback data
      const fallbackPayments = generateFallbackPaymentMethods(bookings);
      setPaymentMethods(fallbackPayments);
    }
  };

  // Load all data with better coordination
  const loadAllData = async () => {
    setLoading(true);
    try {
      // First fetch base data
      const [vehiclesList, bookingsList] = await Promise.all([
        fetchVehiclesForStats(),
        fetchBookingsForStats()
      ]);

      // Then fetch stats and charts
      await Promise.all([
        fetchDashboardStats(),
        fetchRentalTrends(),
        fetchFleetUtilization(),
        fetchRevenueByCategory(),
        fetchPaymentMethods(),
      ]);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch owners for the owner filter dropdown
  const fetchOwners = async () => {
    try {
      console.log('Fetching owners list...');
      const response = await apiClient.get('/users/admin/all?limit=1000');
      console.log('Owners response:', response);

      if (response.success && response.data) {
        const data = (response.data && typeof response.data === 'object' && 'data' in response.data)
          ? (response.data as { data: any }).data
          : response.data;
        const usersList = Array.isArray(data) ? data : data.users || [];

        // Filter for owners or vehicle owners
        interface OwnerUser {
          id: number;
          first_name?: string;
          last_name?: string;
          name?: string;
          email: string;
          role?: string;
          user_type?: string;
          is_owner?: boolean;
        }

        const ownersList: Owner[] = (usersList as OwnerUser[])
          .filter((user: OwnerUser) => user.role === 'owner' || user.user_type === 'owner' || user.is_owner)
          .map((owner: OwnerUser) => ({
            id: owner.id,
            name: `${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.name || owner.email,
            email: owner.email,
          }));

        setOwners(ownersList);
      } else {
        setOwners([]);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
      setOwners([]);
    }
  };

  // Effects
  useEffect(() => {
    fetchOwners();
  }, []);

  useEffect(() => {
    loadAllData();
  }, [selectedPeriod, selectedOwner]);

  useEffect(() => {
    fetchRentalTrends();
  }, [trendsTimeframe, selectedOwner]);

  // Enhanced effects to trigger fallback when data is available
  useEffect(() => {
    console.log('Effect triggered - vehicles:', vehicles.length, 'bookings:', bookings.length);

    if (vehicles.length > 0 && bookings.length > 0) {
      console.log('Both vehicles and bookings available, checking charts...');

      // If charts are empty but we have data, generate fallbacks
      if (rentalTrends.length === 0) {
        console.log('Generating rental trends fallback...');
        const fallbackTrends = generateFallbackRentalTrends(bookings, trendsTimeframe);
        setRentalTrends(fallbackTrends);
      }

      if (fleetUtilization.length === 0) {
        console.log('Generating fleet utilization fallback...');
        const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
        setFleetUtilization(fallbackUtilization);
      }

      if (revenueByCategory.length === 0) {
        console.log('Generating revenue by category fallback...');
        const fallbackRevenue = generateFallbackRevenueByCategory(bookings, vehicles);
        setRevenueByCategory(fallbackRevenue);
      }

      if (paymentMethods.length === 0) {
        console.log('Generating payment methods fallback...');
        const fallbackPayments = generateFallbackPaymentMethods(bookings);
        setPaymentMethods(fallbackPayments);
      }
    } else if (vehicles.length > 0) {
      // If we only have vehicles, still generate fleet utilization
      console.log('Only vehicles available, generating fleet utilization...');
      if (fleetUtilization.length === 0) {
        const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
        setFleetUtilization(fallbackUtilization);
      }
    }
  }, [vehicles, bookings, trendsTimeframe]);

  // Prepare chart data with better debugging - FIXED
  const fleetUtilizationChartData = fleetUtilization.map((item, index) => {
    console.log('Preparing chart data for:', item);
    return {
      name: item.category || 'Unknown',
      value: Number(item.utilization) || 0,
      color: chartColors[index % chartColors.length],
    };
  });

  // FIXED: Add missing paymentMethodsChartData
  const paymentMethodsChartData = paymentMethods.map((item, index) => ({
    name: item.method || 'Unknown',
    value: Number(item.percentage) || 0,
    color: chartColors[index % chartColors.length],
  }));

  console.log('Fleet utilization chart data:', fleetUtilizationChartData);
  console.log('Payment methods chart data:', paymentMethodsChartData);

  if (loading) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
            Loading reports...
          </div>
        </div>
      </div>
    );
  }

  async function handleExport(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): Promise<void> {
    event.preventDefault();
    setExportLoading(true);
    try {
      // Prepare CSV headers and rows
      const headers = [
        'Rental ID',
        'User',
        'Vehicle',
        'Category',
        'Start Date',
        'End Date',
        'Amount',
        'Payment Method',
        'Status',
        'Rating'
      ];
      const rows = bookings.map((booking) => {
        const vehicle = vehicles.find(v => v.id === booking.vehicle_id);
        return [
          booking.id,
          booking.user_name || booking.user?.name || '',
          vehicle?.name || vehicle?.model || '',
          vehicle?.category || vehicle?.vehicle_category || '',
          booking.start_date || '',
          booking.end_date || '',
          booking.total_amount || booking.amount || booking.price || '',
          booking.payment_method || booking.payment_type || '',
          booking.status || '',
          booking.rating || ''
        ];
      });

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');

      // Create a blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'autofleet_reports.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  const handlePDFExport = async () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const currentDate = new Date();

      // User info for attribution
      // FIX: Get userProfile from localStorage or a global user context (fallback to default)
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
      const currentUserName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.name || userProfile.email : 'Admin User';
      const currentUserEmail = userProfile?.email || 'admin@example.com';

      // Header
      doc.setFillColor(44, 62, 125);
      doc.rect(0, 0, pageWidth, 35, 'F');
      try {
        doc.addImage(logo, 'PNG', 20, 8, 20, 20);
      } catch {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('🚗 AutoFleet Hub', 20, 18);
      }
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('AutoFleet Hub', 45, 18);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Reports & Analytics', pageWidth - 20, 18, { align: 'right' });
      doc.setFontSize(10);
      doc.text('Professional Fleet Management System', pageWidth - 20, 26, { align: 'right' });

      // Report Info
      let yPos = 50;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Report Information', 20, yPos);
      yPos += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const reportInfo = [
        ['Report Type:', 'Reports & Analytics'],
        ['Generated By:', currentUserName],
        ['User Email:', currentUserEmail],
        ['Export Date:', currentDate.toLocaleDateString()],
        ['Export Time:', currentDate.toLocaleTimeString()],
        ['Period:', selectedPeriod],
        ['Owner Filter:', selectedOwner ? owners.find(o => o.id.toString() === selectedOwner)?.name || selectedOwner : 'All Owners'],
        ['Total Rentals:', dashboardStats.totalRentals.toString()],
        ['Total Revenue:', dashboardStats.totalRevenue.toString()],
        ['Fleet Utilization:', `${dashboardStats.fleetUtilization.toFixed(1)}%`],
        ['Average Rating:', dashboardStats.averageRating.toFixed(1)]
      ];
      reportInfo.forEach(([label, value], idx) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPos + (idx * 6));
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos + (idx * 6));
      });

      // Rental Trends Table
      yPos += reportInfo.length * 6 + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Rental Trends', 20, yPos);
      const rentalTrendsTable = autoTable(doc, {
        startY: yPos + 5,
        head: [['Day', 'Date', 'Rentals']],
        body: rentalTrends.map(trend => [trend.day, trend.date, trend.rentals]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 125], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      }) as any;

      // Revenue by Category Table
      yPos = (rentalTrendsTable?.lastAutoTable?.finalY ?? yPos) + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Revenue by Category', 20, yPos);
      const revenueByCategoryTable = autoTable(doc, {
        startY: yPos + 5,
        head: [['Category', 'Revenue', 'Bookings']],
        body: revenueByCategory.map(cat => [cat.category, safeFormatPrice(cat.revenue), cat.bookings]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 125], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      }) as any;

      // Payment Methods Table
      yPos = (revenueByCategoryTable && revenueByCategoryTable.lastAutoTable?.finalY ? revenueByCategoryTable.lastAutoTable.finalY : yPos) + 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Methods', 20, yPos);
      autoTable(doc, {
        startY: yPos + 5,
        head: [['Method', 'Usage (%)', 'Amount']],
        body: paymentMethods.map(pm => [pm.method, pm.percentage.toFixed(1), safeFormatPrice(pm.amount)]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 125], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
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
      const fileName = `AutoFleet_Reports_${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}_${String(currentDate.getHours()).padStart(2, '0')}${String(currentDate.getMinutes()).padStart(2, '0')}.pdf`;
      doc.save(fileName);

      alert('PDF report exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className={`flex min-h-screen ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Sidebar */}


      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Report Header */}
        <ReportHeader
          title="Reports & Analytics"
          user={settings?.user?.name || "Unknown User"}
          time={new Date().toLocaleString()}
          logoUrl={logo}
        />

        {/* Top controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-900 shadow-sm min-w-[140px] font-medium"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white text-gray-900 shadow-sm min-w-[160px] font-medium"
          >
            <option value="">All Owners</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id.toString()}>
                {owner.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow ml-auto disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Stats Cards - Fixed with safe formatting */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Rentals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(dashboardStats.totalRentals || 0).toLocaleString()}
                </p>
                <p className="text-sm text-green-600 font-medium">{dashboardStats.rentalChange}</p>
                <p className="text-xs text-gray-500">({bookings.length} in DB)</p>
              </div>
              <ClipboardList className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{safeFormatPrice(dashboardStats.totalRevenue)}</p>
                <p className="text-sm text-green-600 font-medium">{dashboardStats.revenueChange}</p>
              </div>
              <FileText className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Fleet Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{safeFormatPercentage(dashboardStats.fleetUtilization)}</p>
                <p className="text-sm text-red-600 font-medium">{dashboardStats.utilizationChange}</p>
                <p className="text-xs text-gray-500">({vehicles.filter(v => v.status === 'approved').length}/{vehicles.length} vehicles)</p>
              </div>
              <BarChart2 className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{safeFormatNumber(dashboardStats.averageRating, 1)}</p>
                <p className="text-sm text-green-600 font-medium">{dashboardStats.ratingChange}</p>
              </div>
              <Star className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Rental Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700 text-lg">Rental Trends</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setTrendsTimeframe('daily')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${trendsTimeframe === 'daily'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setTrendsTimeframe('weekly')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${trendsTimeframe === 'weekly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTrendsTimeframe('monthly')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${trendsTimeframe === 'monthly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-64">
              {rentalTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rentalTrends}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rentals" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No rental trends data available
                </div>
              )}
            </div>
          </div>

          {/* Fleet Utilization */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">Fleet Utilization</h3>
            <div className="h-64">
              {fleetUtilizationChartData.length > 0 && fleetUtilizationChartData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={fleetUtilizationChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {fleetUtilizationChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Utilization']} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div>Fleet utilization data available but all 0%</div>
                  <div className="text-xs mt-2">
                    Vehicles: {vehicles.length}, Fleet data: {fleetUtilization.length}
                  </div>
                  <div className="text-xs mt-1 text-red-500">
                    Issue: Vehicles status might be "Approved" instead of "approved"
                  </div>
                  <button
                    onClick={() => {
                      console.log('Manually regenerating fleet utilization...');
                      const fallbackUtilization = generateFallbackFleetUtilization(vehicles);
                      setFleetUtilization(fallbackUtilization);
                    }}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>

            {/* Show raw data for debugging */}
            {fleetUtilization.length > 0 && (
              <div className="mt-4 text-xs text-gray-600">
                <div className="font-semibold mb-1">Fleet Data:</div>
                {fleetUtilization.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{item.category}:</span>
                    <span>{item.activeVehicles}/{item.totalVehicles} ({item.utilization.toFixed(1)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Category & Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue by Category */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">Revenue by Category</h3>
            <div className="h-64">
              {revenueByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByCategory}>
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [safeFormatPrice(value), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 text-lg mb-4">Payment Methods</h3>
            <div className="h-64">
              {paymentMethodsChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={paymentMethodsChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {paymentMethodsChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Usage']} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No payment methods data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function generateFallbackFleetUtilization(vehicles: any[]): FleetUtilization[] {
  if (!Array.isArray(vehicles) || vehicles.length === 0) return [];

  // Group vehicles by category
  const categoryMap: Record<string, { total: number; active: number }> = {};

  vehicles.forEach((vehicle) => {
    const category =
      vehicle.category ||
      vehicle.vehicle_category ||
      vehicle.type ||
      "Unknown";
    if (!categoryMap[category]) {
      categoryMap[category] = { total: 0, active: 0 };
    }
    categoryMap[category].total += 1;
    if (
      String(vehicle.status).toLowerCase() === "approved" ||
      String(vehicle.status).toLowerCase() === "active"
    ) {
      categoryMap[category].active += 1;
    }
  });

  // Build FleetUtilization array
  return Object.entries(categoryMap).map(([category, { total, active }]) => ({
    category,
    utilization: total > 0 ? (active / total) * 100 : 0,
    totalVehicles: total,
    activeVehicles: active,
  }));
}

function generateFallbackPaymentMethods(bookings: any[]): PaymentMethod[] {
  if (!Array.isArray(bookings) || bookings.length === 0) return [];

  // Count bookings by payment method
  const methodMap: Record<string, { count: number; amount: number }> = {};

  bookings.forEach((booking) => {
    const method =
      booking.payment_method ||
      booking.payment_type ||
      booking.method ||
      "Unknown";
    const amount = Number(booking.total_amount || booking.amount || booking.price || 0);
    if (!methodMap[method]) {
      methodMap[method] = { count: 0, amount: 0 };
    }
    methodMap[method].count += 1;
    methodMap[method].amount += amount;
  });

  const totalCount = Object.values(methodMap).reduce((sum, v) => sum + v.count, 0);

  return Object.entries(methodMap).map(([method, { count, amount }]) => ({
    method,
    percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    amount,
  }));
}

export default ReportsAnalyticsPage;
function generateFallbackRevenueByCategory(bookings: any[], vehicles: any[]): RevenueCategory[] {
  if (!Array.isArray(bookings) || bookings.length === 0) return [];

  // Build a map of vehicleId -> category
  const vehicleCategoryMap: Record<string, string> = {};
  vehicles.forEach((vehicle) => {
    const id = vehicle.id || vehicle.vehicle_id;
    const category =
      vehicle.category ||
      vehicle.vehicle_category ||
      vehicle.type ||
      "Unknown";
    if (id !== undefined && id !== null) {
      vehicleCategoryMap[String(id)] = category;
    }
  });

  // Group bookings by category
  const categoryMap: Record<string, { revenue: number; bookings: number }> = {};

  bookings.forEach((booking) => {
    const vehicleId = booking.vehicle_id || booking.vehicle?.id;
    let category =
      booking.category ||
      booking.vehicle_category ||
      (vehicleId ? vehicleCategoryMap[String(vehicleId)] : undefined) ||
      "Unknown";
    if (!category) category = "Unknown";
    const amount = Number(booking.total_amount || booking.amount || booking.price || 0);

    if (!categoryMap[category]) {
      categoryMap[category] = { revenue: 0, bookings: 0 };
    }
    categoryMap[category].revenue += amount;
    categoryMap[category].bookings += 1;
  });

  return Object.entries(categoryMap).map(([category, { revenue, bookings }]) => ({
    category,
    revenue,
    bookings,
  }));
}


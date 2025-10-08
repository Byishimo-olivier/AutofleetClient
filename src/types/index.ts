// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'owner' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Vehicle types
export interface Vehicle {
  id: number;
  owner_id: number;
  make: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'van' | 'truck';
  license_plate: string;
  color?: string;
  seats?: number;
  transmission: 'manual' | 'automatic';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  daily_rate: number;
  description?: string;
  features: string[];
  images: string[];
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  created_at: string;
  updated_at: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
  owner_email?: string;
}

// Booking types
export interface Booking {
  id: number;
  customer_id: number;
  vehicle_id: number;
  start_date: string;
  end_date: string;
  pickup_location?: string;
  dropoff_location?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  payment_transaction_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  type?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_email?: string;
}

// Feedback types
export interface Feedback {
  id: number;
  booking_id: number;
  customer_id: number;
  vehicle_id: number;
  rating: number;
  comment?: string;
  service_rating?: number;
  vehicle_condition_rating?: number;
  created_at: string;
  customer_first_name?: string;
  customer_last_name?: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  start_date?: string;
  end_date?: string;
}

// Notification types
export interface Notification {
  id: number;
  user_id: number;
  type: 'booking' | 'payment' | 'reminder' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    results: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems?: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'customer' | 'owner';
}

export interface VehicleForm {
  make: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'van' | 'truck';
  licensePlate: string;
  color?: string;
  seats?: number;
  transmission: 'manual' | 'automatic';
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  dailyRate: number;
  description?: string;
  features: string[];
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  images?: File[];
}

export interface BookingForm {
  vehicleId: number;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
}

export interface FeedbackForm {
  bookingId: number;
  rating: number;
  comment?: string;
  serviceRating?: number;
  vehicleConditionRating?: number;
}

// Filter types
export interface VehicleFilters {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics types
export interface DashboardStats {
  totalVehicles?: number;
  availableVehicles?: number;
  totalBookings?: number;
  totalRevenue?: number;
  activeBookings?: number;
  averageRating?: number;
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
  avgBookingValue: number;
}

export interface VehicleUtilization {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: string;
  dailyRate: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  utilizationRate: number;
}


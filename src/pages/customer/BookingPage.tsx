import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { useSettings } from '@/contexts/SettingContxt';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

// Move type/interface definitions outside the component
interface Vehicle {
  id: string;
  name: string;
  type: string;
  status: string;
  img: string;
  images?: string[] | string;
  listing_type: string;
  selling_price?: number;
  price?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  make?: string;
  model?: string;
  location_address?: string;
  locationAddress?: string;
  locationLat?: number;
  locationLng?: number;
}

type PaymentMethod = "mobile" | "card";

interface BookingData {
  customerId: any;
  vehicle_id: string | undefined;
  pickup_location: string;
  pickup_date: string;
  return_date: string;
  payment_method: PaymentMethod;
  total_price: number;
  transaction_id?: string;
  flw_transaction_id?: number;
  telephone?: string;
}

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleFromState = location.state?.vehicle;

  const [vehicle, setVehicle] = useState<Vehicle | null>(vehicleFromState || null);
  const [loading, setLoading] = useState(!vehicleFromState);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Booking form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState(todayStr); // Default to today
  const [returnDate, setReturnDate] = useState(todayStr); // Default to today
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mobile");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [telephone, setTelephone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [txNonce, setTxNonce] = useState(0);
  const [isPendingPayment, setIsPendingPayment] = useState(false);

  const { settings, formatPrice, t } = useSettings();
  const { user } = useAuth();

  // Helper functions moved up to fix hoisting/declaration issues
  const calculateTotalDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Ensure at least 1 day for rentals
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    if (!vehicle) return 0;
    const isForSale = vehicle.listing_type === "sale";
    if (isForSale) return vehicle.selling_price || 0;
    return days * (vehicle.price || 0);
  };

  // Flutterwave Config — computed fresh whenever paymentMethod, currency, or txNonce changes
  const fwConfig = React.useMemo(() => {
    const isMobile = paymentMethod === 'mobile';
    let amount = calculateTotalPrice();
    let currency = settings.currency || 'RWF';

    // Always use RWF for Mobile Money Rwanda
    if (isMobile) {
      if (currency === 'USD') {
        amount = Math.round(amount * 1400); // approx conversion
      }
      currency = 'RWF';
    }

    // Enforce minimum amounts to avoid gateway rejection
    if (currency === 'RWF' && amount < 500) amount = 500;
    if (currency === 'USD' && amount < 1) amount = 1;

    return {
      public_key: import.meta.env.VITE_FLW_PUBLIC_KEY || '',
      tx_ref: `tx-${Date.now()}-${txNonce}-${Math.random().toString(36).substring(2, 9)}`,
      amount,
      currency,
      payment_options: isMobile ? 'mobilemoneyrwanda' : 'card',
      customer: {
        email: user?.email || 'customer@autofleet.rw',
        phone_number: telephone.trim() || '250',
        name: user ? `${user.first_name} ${user.last_name}` : 'Customer',
      },
      customizations: {
        title: 'AutoFleet Hub',
        description: `Payment for ${vehicle?.make || ''} ${vehicle?.model || ''}`,
        logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-abstract-minimal-car-logo-design.jpg',
      },
    };
  }, [paymentMethod, settings.currency, txNonce, user, telephone, vehicle]); // full deps

  const handleFlutterPayment = useFlutterwave(fwConfig);

  useEffect(() => {
    if (!vehicleFromState && vehicleId) {
      fetchVehicleDetails();
    }
  }, [vehicleId, vehicleFromState]);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/vehicles/${vehicleId}`);
      if (res && res.success && res.data) {
        const v = res.data as Partial<Vehicle> & { location_lat?: number; location_lng?: number };
        setVehicle({
          ...v,
          locationLat: v.locationLat !== undefined && v.locationLat !== null
            ? Number(v.locationLat)
            : v.location_lat !== undefined && v.location_lat !== null
              ? Number(v.location_lat)
              : undefined,
          locationLng: v.locationLng !== undefined && v.locationLng !== null
            ? Number(v.locationLng)
            : v.location_lng !== undefined && v.location_lng !== null
              ? Number(v.location_lng)
              : undefined,
        } as Vehicle);
        console.log('Fetched vehicle:', {
          locationLat: v.locationLat ?? v.location_lat,
          locationLng: v.locationLng ?? v.location_lng,
          raw: v
        });
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
    setLoading(false);
  };

  // Helper function to open Google Maps navigation
  const openGoogleMapsNavigation = (lat: number, lng: number) => {
    if (
      lat === undefined || lat === null ||
      lng === undefined || lng === null ||
      isNaN(Number(lat)) || isNaN(Number(lng))
    ) {
      alert('GPS coordinates are not available for this vehicle.');
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const getImageUrl = (img: string | undefined): string => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const normalizedImg = img.startsWith("/") ? img : `/${img}`;
    return `${STATIC_BASE_URL}${normalizedImg}`;
  };

  const parseVehicleImages = (images: string[] | string | undefined): string[] => {
    try {
      if (Array.isArray(images)) return images;
      if (images && typeof images === 'string' && images.trim() !== '') {
        try {
          const parsed = JSON.parse(images);
          return Array.isArray(parsed) ? parsed : [images];
        } catch {
          return images.split(',').map(img => img.trim()).filter(Boolean);
        }
      }
      return [];
    } catch (e) {
      console.error('Error parsing vehicle images:', e);
      return [];
    }
  };


  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    const isForSale = vehicle?.listing_type === "sale";
    if (!pickupLocation || (!isForSale && (!pickupDate || !returnDate))) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user || !user.email) {
      console.error('CRITICAL: User object or email missing in handleBooking!', {
        user,
        hasEmail: !!user?.email,
        keys: Object.keys(user || {})
      });
      alert("Please ensure you are logged in and have an email associated with your account.");
      return;
    }

    const bookingPrice = calculateTotalPrice();
    if (bookingPrice <= 0) {
      alert("Total price must be greater than 0 to proceed with payment.");
      return;
    }

    // Increment nonce to ensure a NEW tx_ref, then trigger via useEffect
    setTxNonce(prev => prev + 1);
    setIsPendingPayment(true);
  };

  // Separate effect to trigger payment once config has rotated
  useEffect(() => {
    if (isPendingPayment && !loading && vehicle) {
      setIsPendingPayment(false);
      console.log("Triggering Flutterwave with fresh nonce:", txNonce);
      handleFlutterPayment({
        callback: async (response) => {
          console.log("Flutterwave payment response:", response);
          setIsPendingPayment(false);

          if (response.status === "successful") {
            try {
              const isForSale = vehicle?.listing_type === "sale";
              const bookingData: BookingData = {
                vehicle_id: vehicleId,
                pickup_location: pickupLocation,
                pickup_date: pickupDate,
                return_date: returnDate,
                payment_method: paymentMethod,
                total_price: calculateTotalPrice(),
                flw_transaction_id: response.transaction_id,
                ...(paymentMethod === "mobile" && {
                  telephone: telephone,
                }),
                customerId: user?.id
              };

              const createRes = await apiClient.post('/bookings', bookingData);

              if (createRes && createRes.success && createRes.data) {
                const bookingId = (createRes.data as any)?.booking?.id ?? (createRes.data as any)?.id;
                const verifyRes = await apiClient.post('/bookings/verify-payment', {
                  transaction_id: response.transaction_id,
                  booking_id: bookingId
                });

                if (verifyRes && verifyRes.success) {
                  setSuccessMessage(isForSale ? "Payment verified and vehicle purchased!" : "Payment verified and booking confirmed!");
                  setErrorMessage("");
                  setTimeout(() => navigate("/MyBookings"), 1500);
                } else {
                  setErrorMessage("Payment verification failed. Please contact support.");
                }
              }
            } catch (error: any) {
              console.error("Booking/Verification error:", error);
              setErrorMessage(error.message || "Failed to finalize transaction.");
            }
          } else {
            setErrorMessage("Payment was not successful. Please try again.");
          }
          closePaymentModal();
        },
        onClose: () => {
          setIsPendingPayment(false);
          setErrorMessage('Payment was cancelled. Please try again if needed.');
        },
      });
    }
  }, [txNonce, isPendingPayment, loading, vehicle, handleFlutterPayment]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-xl">Loading vehicle details...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vehicle Not Found</h2>
          <button
            onClick={() => navigate("/home")}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const vehicleImages = parseVehicleImages(vehicle.images);
  const allImages = [vehicle.img, ...vehicleImages].filter(Boolean);
  const currentImage = allImages[currentImageIndex] || vehicle.img;
  const isForSale = vehicle.listing_type === "sale";

  return (
    <div className={`min-h-screen pb-12 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`shadow-sm sticky top-0 z-10 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition ${settings.darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl shadow-lg overflow-hidden ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {/* Image Gallery */}
              <div className="relative">
                <img
                  src={getImageUrl(currentImage)}
                  alt={vehicle.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />

                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) =>
                        prev === 0 ? allImages.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) =>
                        prev === allImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`h-2 rounded-full transition ${idx === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/50 w-2"
                            }`}
                        />
                      ))}
                    </div>

                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className={`text-3xl font-bold mb-2 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {vehicle.name}
                    </h1>
                    <p className="text-xl text-blue-600 font-semibold">{vehicle.type}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${vehicle.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : (vehicle.status === "Rented" || vehicle.status === "Sold")
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className={`font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {vehicle.rating || 4.7}
                    </span>
                  </div>
                  <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    ({vehicle.reviews || 120} reviews)
                  </span>
                </div>

                {/* Vehicle Features */}
                <div className={`border-t pt-6 ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-4 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Vehicle Features
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">❄️</span>
                      </div>
                      {(() => {
                        // Always use locationLat/locationLng, fallback to location_lat/location_lng
                        const lat = vehicle.locationLat !== undefined && vehicle.locationLat !== null
                          ? vehicle.locationLat
                          : (vehicle as any).location_lat;
                        const lng = vehicle.locationLng !== undefined && vehicle.locationLng !== null
                          ? vehicle.locationLng
                          : (vehicle as any).location_lng;
                        const valid = lat !== undefined && lat !== null &&
                          lng !== undefined && lng !== null &&
                          !isNaN(Number(lat)) && !isNaN(Number(lng));
                        return valid ? (
                          <button
                            className={`${settings.darkMode ? 'text-white hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition-colors duration-200 font-medium text-left`}
                            onClick={() => openGoogleMapsNavigation(Number(lat), Number(lng))}
                          >
                            GPS Navigation
                          </button>
                        ) : (
                          <span className={settings.darkMode ? 'text-gray-500' : 'text-gray-400'}>
                            GPS not available
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">🔄</span>
                      </div>
                      <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Automatic
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🔊</span>
                      </div>
                      <span className={settings.darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        Bluetooth
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className={`border-t pt-6 mt-6 ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-bold mb-3 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Description
                    </h3>
                    <p className={`leading-relaxed ${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {vehicle.description}
                    </p>
                  </div>
                )}

                {/* Location Section */}
                {(vehicle.locationAddress || vehicle.location_address || (vehicle.locationLat !== undefined && vehicle.locationLng !== undefined)) && (
                  <div className={`border-t pt-6 mt-6 ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <h3 className={`text-lg font-bold mb-3 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Vehicle Location
                    </h3>
                    <div className="space-y-3">
                      {(vehicle.locationAddress || vehicle.location_address) && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                          <p className={`${settings.darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {vehicle.locationAddress || vehicle.location_address}
                          </p>
                        </div>
                      )}
                      {vehicle.locationLat !== undefined && vehicle.locationLng !== undefined &&
                        !isNaN(Number(vehicle.locationLat !== undefined && vehicle.locationLat !== null ? vehicle.locationLat : (vehicle as any).location_lat)) &&
                        !isNaN(Number(vehicle.locationLng !== undefined && vehicle.locationLng !== null ? vehicle.locationLng : (vehicle as any).location_lng)) && (
                          <button
                            onClick={() => {
                              const lat = vehicle.locationLat !== undefined && vehicle.locationLat !== null ? vehicle.locationLat : (vehicle as any).location_lat;
                              const lng = vehicle.locationLng !== undefined && vehicle.locationLng !== null ? vehicle.locationLng : (vehicle as any).location_lng;
                              openGoogleMapsNavigation(Number(lat), Number(lng));
                            }}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <MapPin className="w-5 h-5" />
                            Get Directions to Vehicle
                            <span className="ml-2 text-xs font-mono">[
                              {Number(vehicle.locationLat !== undefined && vehicle.locationLat !== null ? vehicle.locationLat : (vehicle as any).location_lat).toFixed(6)},
                              {Number(vehicle.locationLng !== undefined && vehicle.locationLng !== null ? vehicle.locationLng : (vehicle as any).location_lng).toFixed(6)}
                              ]</span>
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className={`rounded-2xl shadow-lg p-6 sticky top-24 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-6 ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                {isForSale ? "Purchase This Vehicle" : "Book This Vehicle"}
              </h2>

              <form onSubmit={handleBooking} className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      placeholder="Enter pickup location"
                      required
                    />
                  </div>
                </div>

                {/* Dates - only show for rent */}
                {!isForSale && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Pickup Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className={`w-full pl-10 pr-2 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${settings.darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Return Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className={`w-full pl-10 pr-2 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${settings.darkMode
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className={`rounded-lg p-4 space-y-2 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  {!isForSale && (
                    <div className="flex justify-between text-sm">
                      <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Days:
                      </span>
                      <span className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {calculateTotalDays()} days
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className={settings.darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {isForSale ? "Vehicle Price:" : "Daily Rate:"}
                    </span>
                    <span className={`font-semibold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {formatPrice(isForSale ? vehicle.selling_price || 0 : vehicle.price || 0)}{!isForSale && "/day"}
                    </span>
                  </div>
                  <div className={`border-t pt-2 mt-2 ${settings.darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between">
                      <span className={`font-bold ${settings.darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Total Price:
                      </span>
                      <span className="font-bold text-green-600 text-xl">
                        {formatPrice(calculateTotalPrice())}
                      </span>
                    </div>
                    {paymentMethod === 'mobile' && settings.currency === 'USD' && (
                      <div className="flex justify-between mt-1 text-xs font-medium text-blue-600">
                        <span>Converted to RWF:</span>
                        <span>₣{(calculateTotalPrice() * 1400).toLocaleString()} (approx.)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mobile")}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${paymentMethod === "mobile"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : `border-gray-300 hover:border-gray-400 ${settings.darkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600'
                          : 'bg-white text-gray-700'
                        }`
                        }`}
                    >
                      Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${paymentMethod === "card"
                        ? "border-blue-600 bg-blue-50 text-blue-600"
                        : `border-gray-300 hover:border-gray-400 ${settings.darkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600'
                          : 'bg-white text-gray-700'
                        }`
                        }`}
                    >
                      Card
                    </button>
                  </div>

                  {/* Test Mode hint */}
                  {import.meta.env.MODE === 'development' && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      <strong>🧪 Test Mode:</strong> Use Card for instant test.
                      Card: <code>4187427415564246</code> | CVV: <code>828</code> | Exp: <code>09/32</code> | PIN: <code>12345</code>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                {paymentMethod === "mobile" && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Telephone
                    </label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                )}

                {/* Card payment fields */}
                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Card number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Expiry date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Security code
                        </label>
                        <input
                          type="password"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value)}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${settings.darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          placeholder="CVV"
                        />
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${settings.darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
                      <span>Your card is processed securely by Flutterwave. We never store your card details.</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="submit"
                    className={`font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 ${vehicle.status === "Rented" || vehicle.status === "Sold"
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    disabled={vehicle.status === "Rented" || vehicle.status === "Sold"}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {vehicle.status === "Rented" ? "RENTED" : vehicle.status === "Sold" ? "SOLD" : "Confirm & Pay"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mt-4 text-center">
                    <span className="text-red-500 text-sm font-medium">
                      {errorMessage}
                    </span>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="mt-4 text-center">
                    <span className="text-green-600 text-sm font-medium">
                      {successMessage}
                    </span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};


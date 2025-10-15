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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

// Replace this with your actual token retrieval logic
const yourToken = localStorage.getItem('token') || '';

// Optionally, set up an interceptor to add the Authorization header to every request
// Add Authorization header manually in each request below if token exists

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const vehicleFromState = location.state?.vehicle;

  const [vehicle, setVehicle] = useState(vehicleFromState || null);
  const [loading, setLoading] = useState(!vehicleFromState);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Booking form state
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobile");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [telephone, setTelephone] = useState("");
  const [booking, setBooking] = useState<any>(null);

  const { settings, formatPrice, t } = useSettings();

  useEffect(() => {
    if (!vehicleFromState) {
      fetchVehicleDetails();
    }
  }, [id, vehicleFromState]);

  const fetchVehicleDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/vehicles/${id}`);
      if (res && res.success && res.data) {
        setVehicle(res.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
    setLoading(false);
  };
    const fetchBooking = async (bookingId: string) => {
      try {
        const res = await apiClient.get(`/bookings/${bookingId}`);
        if (res && res.success && res.data) {
          // res.data contains booking info, including images array
          setBooking(res.data);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };
  
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
  }
  
  type PaymentMethod = "mobile" | "card";
  
  interface BookingData {
    vehicle_id: string | undefined;
    pickup_location: string;
    pickup_date: string;
    return_date: string;
    payment_method: PaymentMethod;
    total_price: number;
    card_number?: string;
    expiry_date?: string;
    security_code?: string;
    telephone?: string;
  }

  const getImageUrl = (img: string | undefined): string => {
    if (!img) return "/placeholder.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const normalizedImg = img.startsWith("/") ? img : `/${img}`;
    return `${STATIC_BASE_URL}${normalizedImg}`;
  };

  interface ParseVehicleImages {
    (images: string[] | string | undefined): string[];
  }

  const parseVehicleImages: ParseVehicleImages = (images) => {
    try {
      if (Array.isArray(images)) return images;
      if (images && typeof images === 'string' && images.trim() !== '') {
        return JSON.parse(images);
      }
      return [];
    } catch (e) {
      return [];
    }
  };

  const calculateTotalDays = () => {
    if (!pickupDate || !returnDate) return 0;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = () => {
    const days = calculateTotalDays();
    if (!vehicle) return 0;
    const isForSale = vehicle.listing_type === "sale";
    if (isForSale) return vehicle.selling_price || 0;
    return days * (vehicle.price || 0);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!pickupLocation || !pickupDate || !returnDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (paymentMethod === "card" && (!cardNumber || !expiryDate || !securityCode)) {
      alert("Please fill in all card details");
      return;
    }

    if (paymentMethod === "mobile" && !telephone) {
      alert("Please enter your telephone number");
      return;
    }

    if (!id) {
      alert("Vehicle ID is missing. Cannot proceed with booking.");
      return;
    }
    const bookingData = {
      vehicle_id: id,
      pickup_location: pickupLocation,
      pickup_date: pickupDate,
      return_date: returnDate,
      payment_method: paymentMethod,
      total_price: calculateTotalPrice(),
      ...(paymentMethod === "card" && {
        card_number: cardNumber,
        expiry_date: expiryDate,
        security_code: securityCode,
      }),
      ...(paymentMethod === "mobile" && {
        telephone: telephone,
      }),
    };

    try {
      const res = await apiClient.post("/bookings", bookingData);
      if (res && res.success) {
        alert("Booking confirmed successfully!");
        navigate("/customer/my-bookings");
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading vehicle details...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vehicle Not Found</h2>
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const images = Array.isArray(booking?.images) ? booking.images : [];
  const allImages = [vehicle.img, ...images].filter(Boolean);
  const currentImage = allImages[currentImageIndex] || vehicle.img;
  const isForSale = vehicle.listing_type === "sale";

  return (
    <div className={`min-h-screen pb-12 ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
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
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition ${
                            idx === currentImageIndex ? "bg-white w-8" : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {vehicle.name}
                    </h1>
                    <p className="text-xl text-blue-600 font-semibold">{vehicle.type}</p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      vehicle.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-800">{vehicle.rating || 4.7}</span>
                  </div>
                  <span className="text-gray-500">
                    ({vehicle.reviews || 120} reviews)
                  </span>
                </div>

                {/* Vehicle Features */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Vehicle Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">❄️</span>
                      </div>
                      <span className="text-gray-700">Air Conditioning</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-bold">🚗</span>
                      </div>
                      <span className="text-gray-700">GPS Navigation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">🔄</span>
                      </div>
                      <span className="text-gray-700">Automatic</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">🔊</span>
                      </div>
                      <span className="text-gray-700">Bluetooth</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {vehicle.description && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Book This Vehicle</h2>

              <form onSubmit={handleBooking} className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pickup location"
                      required
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full pl-10 pr-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full pl-10 pr-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Days:</span>
                    <span className="font-semibold text-gray-800">
                      {calculateTotalDays()} days
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Rate:</span>
                    <span className="font-semibold text-gray-800">
                      ${isForSale ? vehicle.selling_price : vehicle.price}/day
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-800">Total Price:</span>
                      <span className="font-bold text-green-600 text-xl">
                        ${calculateTotalPrice()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mobile")}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                        paymentMethod === "mobile"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                        paymentMethod === "card"
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      Card
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === "mobile" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telephone
                    </label>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Security code
                        </label>
                        <input
                          type="text"
                          value={securityCode}
                          onChange={(e) => setSecurityCode(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="CVV"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Confirm & Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
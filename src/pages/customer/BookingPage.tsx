import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Users, 
  Fuel, 
  Gauge,
  Car,
  Shield,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ArrowRight  // Add this import for the right arrow
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

const getImageUrl = (img: string | null | undefined) => {
  if (!img) return "/placeholder.png";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalizedImg = img.startsWith("/") ? img : `/${img}`;
  return `${STATIC_BASE_URL}${normalizedImg}`;
};

const parseVehicleImages = (images: any) => {
  console.log("🔍 Parsing images:", images, "Type:", typeof images);
  
  try {
    // If it's already an array, return it
    if (Array.isArray(images)) {
      console.log("✅ Images is already an array:", images);
      return images;
    }
    
    // If it's a string, try to parse it
    if (images && typeof images === 'string' && images.trim() !== '') {
      // Handle different JSON string formats that might come from the database
      let cleanedImages = images.trim();
      
      // Remove outer quotes if they exist (sometimes databases return quoted JSON)
      if ((cleanedImages.startsWith('"') && cleanedImages.endsWith('"')) ||
          (cleanedImages.startsWith("'") && cleanedImages.endsWith("'"))) {
        cleanedImages = cleanedImages.slice(1, -1);
      }
      
      // Handle escaped quotes
      cleanedImages = cleanedImages.replace(/\\"/g, '"');
      
      console.log("🧹 Cleaned images string:", cleanedImages);
      
      const parsed = JSON.parse(cleanedImages);
      console.log("✅ Successfully parsed:", parsed);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    // If it's null or undefined
    if (images === null || images === undefined) {
      console.log("⚠️ Images is null/undefined");
      return [];
    }
    
    console.log("⚠️ No valid images found");
    return [];
  } catch (e) {
    console.error("❌ Error parsing images:", e);
    console.log("🔍 Raw images value:", images);
    console.log("🔍 Raw images string representation:", JSON.stringify(images));
    
    // Try one more fallback - sometimes it's a malformed JSON
    try {
      if (typeof images === 'string') {
        // Try to extract array-like content with regex
        const arrayMatch = images.match(/\[(.*?)\]/);
        if (arrayMatch) {
          const arrayContent = arrayMatch[1];
          // Split by comma and clean each item
          const items = arrayContent.split(',').map(item => 
            item.trim().replace(/^["']|["']$/g, '')
          ).filter(item => item.length > 0);
          console.log("🔧 Fallback parsing result:", items);
          return items;
        }
      }
    } catch (fallbackError) {
      console.error("❌ Fallback parsing also failed:", fallbackError);
    }
    
    return [];
  }
};

const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicle, setVehicle] = useState<any>(location.state?.vehicle || null);
  const [loading, setLoading] = useState(!location.state?.vehicle);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [paymentTab, setPaymentTab] = useState<"mobile" | "card">("mobile");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [phone, setPhone] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", code: "" });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); // Add this state

  useEffect(() => {
    const fetchVehicle = async () => {
      // If vehicle data was passed via navigation state, use it and skip fetching
      if (location.state?.vehicle) {
        console.log("✅ Using vehicle data from navigation state:", location.state.vehicle);
        return;
      }

      if (!id) {
        console.log("❌ No vehicle ID provided");
        setError("No vehicle ID provided");
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching vehicle with ID:", id);
      setLoading(true);
      setError(null);
      
      try {
        const res = await apiClient.get(`/vehicles/${id}`);
        console.log("📦 API Response:", res);
        
        if (res && res.success && res.data) {
          console.log("✅ Vehicle data loaded:", res.data);
          setVehicle(res.data);
        } else {
          console.log("❌ API returned unsuccessful response:", res);
          setError("Failed to load vehicle details");
        }
      } catch (err) {
        console.error("❌ Error fetching vehicle:", err);
        setError("Failed to load vehicle details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicle();
  }, [id, location.state]);

  const getDays = () => {
    if (!pickup || !returnDate) return 0;
    const start = new Date(pickup);
    const end = new Date(returnDate);
    const diff = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.round(diff);
  };
  
  const days = getDays();
  const isForSale = vehicle?.listing_type === "sale";
  const dailyRate = vehicle?.price || 0;
  const sellingPrice = vehicle?.selling_price || 0;
  const total = isForSale ? sellingPrice : (days * dailyRate);

  const handleBookNow = () => {
    if (!pickupLocation || !pickup || (!isForSale && !returnDate)) {
      alert("Please fill in all required fields");
      return;
    }

    if (paymentTab === "mobile" && !phone) {
      alert("Please enter your phone number");
      return;
    }

    if (paymentTab === "card" && (!card.number || !card.expiry || !card.code)) {
      alert("Please fill in all card details");
      return;
    }

    console.log("Booking details:", {
      vehicleId: id,
      vehicle: vehicle,
      pickupLocation,
      pickup,
      returnDate: isForSale ? null : returnDate,
      days: isForSale ? 0 : days,
      total,
      paymentMethod: paymentTab,
      paymentDetails: paymentTab === "mobile" ? { phone } : card
    });

    alert("Booking submitted successfully!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Loading vehicle details...</div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-red-600 mb-4">{error || "Vehicle not found"}</div>
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  console.log("🖼️ Vehicle data received:", vehicle);
  console.log("📋 All vehicle keys:", Object.keys(vehicle));
  console.log("🖼️ Vehicle.img:", vehicle.img);
  console.log("🖼️ Vehicle.image:", vehicle.image);
  console.log("🖼️ Vehicle.image_url:", vehicle.image_url);
  console.log("🖼️ Vehicle.images:", vehicle.images);
  console.log("💰 Vehicle.price:", vehicle.price);
  console.log("💰 Vehicle.daily_rate:", vehicle.daily_rate);
  console.log("💰 Vehicle.rental_price:", vehicle.rental_price);
  console.log("💰 Vehicle.selling_price:", vehicle.selling_price);
  console.log("📋 Vehicle.listing_type:", vehicle.listing_type);

  // Update the images parsing section with better debugging
  console.log("🖼️ DETAILED VEHICLE DATA:");
  console.log("🖼️ vehicle.img:", JSON.stringify(vehicle.img));
  console.log("🖼️ vehicle.images raw:", vehicle.images);
  console.log("🖼️ vehicle.images type:", typeof vehicle.images);
  console.log("🖼️ vehicle.images length:", vehicle.images?.length);
  console.log("🖼️ vehicle.images JSON string:", JSON.stringify(vehicle.images));

  const images = parseVehicleImages(vehicle.images);
  console.log("🖼️ Parsed images result:", images);
  console.log("🖼️ Parsed images length:", images.length);

  // Create allImages array properly - filter out null/undefined values
  const allImages = [
    vehicle.img,
    ...(Array.isArray(images) ? images : [])
  ].filter(Boolean).map(img => {
    const url = getImageUrl(img);
    console.log(`🖼️ Converting "${img}" to "${url}"`);
    return url;
  });

  console.log("🖼️ Final allImages array:", allImages);
  console.log("🖼️ Total images count:", allImages.length);
  
  const goToPrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNextImage = () => {
    setSelectedImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative group">
                <img
                  src={allImages[selectedImage] || "/placeholder.png"}
                  alt={vehicle.name}
                  className="w-full h-96 object-cover"
                  onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                />
                
                {/* Flash/Expand Icon */}
                <button
                  onClick={() => setIsGalleryOpen(true)}
                  className="absolute top-4 left-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100"
                  aria-label="View all images"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>

                {/* Discover Gallery Button with Arrow - Add this */}
                {allImages.length > 1 && (
                  <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full transition opacity-0 group-hover:opacity-100 flex items-center gap-2"
                    aria-label="View all images"
                  >
                    <span className="text-sm font-medium">View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {/* Status Badge */}
                <span
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                    vehicle.status === "Available"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {vehicle.status}
                </span>

                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedImage + 1} / {allImages.length}
                  </div>
                )}

                {/* Navigation Arrows - Show on hover */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery with Arrow Button */}
              {allImages.length > 1 ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">More Photos</span>
                    <button
                      onClick={() => setIsGalleryOpen(true)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                    >
                      <span>View All ({allImages.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {allImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx 
                            ? "border-blue-600 ring-2 ring-blue-200 scale-105" 
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${vehicle.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Scroll Hint */}
                  {allImages.length > 4 && (
                    <div className="text-center mt-2 text-xs text-gray-500">
                      Scroll to see more images →
                    </div>
                  )}
                </div>
              ) : (
                // Show this if only one image exists
                <div className="p-4 text-center text-gray-500 text-sm">
                  Only one image available for this vehicle
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{vehicle.name}</h1>
                  <p className="text-gray-500 text-lg uppercase">{vehicle.type}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-700">
                    ${isForSale ? sellingPrice : dailyRate}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {isForSale ? "Purchase Price" : "per day"}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6 pb-6 border-b">
                <div className="flex text-yellow-400 text-xl">
                  {Array(5)
                    .fill(0)
                    .map((_, idx) => (
                      <span key={idx} className={idx < Math.round(vehicle.rating) ? "" : "text-gray-300"}>
                        ★
                      </span>
                    ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {vehicle.rating} ({vehicle.reviews} reviews)
                </span>
              </div>

              {/* Specifications */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Specifications</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {vehicle.seats && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Seats</div>
                        <div className="font-semibold">{vehicle.seats}</div>
                      </div>
                    </div>
                  )}
                  {vehicle.fuel_type && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                      <Fuel className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Fuel</div>
                        <div className="font-semibold">{vehicle.fuel_type}</div>
                      </div>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                      <Gauge className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Transmission</div>
                        <div className="font-semibold">{vehicle.transmission}</div>
                      </div>
                    </div>
                  )}
                  {vehicle.year && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-gray-500">Year</div>
                        <div className="font-semibold">{vehicle.year}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {vehicle.features && Array.isArray(vehicle.features) && vehicle.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Features & Amenities</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicle.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {vehicle.description && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* Why Book With Us */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Book With Us?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <div className="font-bold mb-1">Fully Insured</div>
                    <div className="text-blue-100 text-sm">Complete coverage for peace of mind</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Car className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <div className="font-bold mb-1">24/7 Support</div>
                    <div className="text-blue-100 text-sm">Always here to help you</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <div className="font-bold mb-1">Best Price</div>
                    <div className="text-blue-100 text-sm">Guaranteed competitive rates</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isForSale ? "Purchase Vehicle" : "Book This Vehicle"}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {isForSale ? "Delivery" : "Pickup"} Location *
                  </label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location"
                    value={pickupLocation}
                    onChange={e => setPickupLocation(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {isForSale ? "Purchase" : "Pickup"} Date *
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={pickup}
                    onChange={e => setPickup(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {!isForSale && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Return Date *
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={returnDate}
                      onChange={e => setReturnDate(e.target.value)}
                      min={pickup || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                {!isForSale && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-semibold">{days} days</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Daily Rate:</span>
                      <span className="font-semibold">${dailyRate}/day</span>
                    </div>
                    <div className="border-t pt-2 mt-2"></div>
                  </>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Price:</span>
                  <span className="text-green-700">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700">Payment Method</label>
                <div className="flex gap-2 mb-4">
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      paymentTab === "mobile" 
                        ? "bg-blue-700 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setPaymentTab("mobile")}
                    type="button"
                  >
                    Mobile Money
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-lg font-semibold transition ${
                      paymentTab === "card" 
                        ? "bg-blue-700 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setPaymentTab("card")}
                    type="button"
                  >
                    Card
                  </button>
                </div>

                {paymentTab === "mobile" ? (
                  <input
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07xxxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                ) : (
                  <div className="space-y-3">
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Card number"
                      value={card.number}
                      onChange={e => setCard({ ...card, number: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={e => setCard({ ...card, expiry: e.target.value })}
                      />
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="CVV"
                        maxLength={3}
                        value={card.code}
                        onChange={e => setCard({ ...card, code: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button 
                className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-lg mb-3"
                onClick={handleBookNow}
              >
                {isForSale ? "BUY IT" : "Book Now"}
              </button>
              <button 
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                onClick={() => navigate("/customer/dashboard")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Image Gallery Modal - Add this */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition z-10"
              aria-label="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
              {selectedImage + 1} / {allImages.length}
            </div>

            {/* Main Image */}
            <img
              src={allImages[selectedImage] || "/placeholder.png"}
              alt={vehicle.name}
              className="max-w-full max-h-full object-contain"
              onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
            />

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full transition"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-full overflow-x-auto">
                <div className="flex gap-2 px-4">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx 
                          ? "border-white ring-2 ring-white/50" 
                          : "border-white/30 hover:border-white/60"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${vehicle.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailsPage;
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Car,
  CreditCard,
  MessageCircle,
  LifeBuoy,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { apiClient, STATIC_BASE_URL } from "@/services/apiClient";
import { useSettings } from "@/contexts/SettingContxt";

const quickActions = [
  {
    label: "My Bookings",
    desc: "View active rentals",
    icon: <Car className="w-5 h-5" />,
    onClick: (navigate: (path: string) => void) => navigate("/customer/my-bookings"),
  },
  {
    label: "Payment Methods",
    desc: "Manage payments",
    icon: <CreditCard className="w-5 h-5" />,
    onClick: undefined,
  },
  {
    label: "Feedback & Ratings",
    desc: "Rate your experience",
    icon: <MessageCircle className="w-5 h-5" />,
    onClick: undefined,
  },
  {
    label: "Support",
    desc: "Get help 24/7",
    icon: <LifeBuoy className="w-5 h-5" />,
    onClick: (navigate: (path: string) => void) => navigate("/customer/support"),
  },
];

const whyChoose = [
  { value: "500+", label: "Vehicles Available" },
  { value: "10K+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
  { value: "24/7", label: "Customer Support" },
];

export default function CustomerDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const navigate = useNavigate();
  const { settings, formatPrice } = useSettings();

  const isDark = settings?.darkMode;
  const bg = isDark ? "bg-[#0f1115] text-[#e7e7e7]" : "bg-[#f7f2ea] text-[#1f1b16]";
  const panel = isDark ? "bg-[#141823] border-white/10" : "bg-white/70 border-black/5";
  const card = isDark ? "bg-[#141823] border-white/10" : "bg-white border-black/5";
  const subtle = isDark ? "text-white/70" : "text-[#5b5047]";
  const accent = isDark ? "text-[#f6a13a]" : "text-[#b35b15]";
  const accentBg = isDark ? "bg-[#f6a13a] text-black" : "bg-[#b35b15] text-white";

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", "18");
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      if (vehicleType) params.append("type", vehicleType);
      if (pickupDate) params.append("pickupDate", pickupDate);
      if (returnDate) params.append("returnDate", returnDate);

      const res = await apiClient.get<any>(`/vehicles?${params.toString()}`);
      if (res && res.success && res.data && Array.isArray(res.data.vehicles)) {
        setFeaturedVehicles(res.data.vehicles);
        setPagination(res.data.pagination);
      } else {
        setFeaturedVehicles([]);
        setPagination({ currentPage: 1, totalPages: 1 });
      }
      setLoading(false);
    };
    fetchVehicles();
  }, [currentPage, search, location, vehicleType, pickupDate, returnDate]);

  const getImageUrl = (img: string | null | undefined) => {
    if (!img) return "https://placehold.co/600x400?text=No+Image";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const normalizedImg = img.startsWith("/") ? img : `/${img}`;
    return `${STATIC_BASE_URL}${normalizedImg}`;
  };

  const parseVehicleImages = (images: any) => {
    let parsedImages = [] as any[];
    try {
      if (Array.isArray(images)) {
        parsedImages = images;
      } else if (images && typeof images === "string" && images.trim() !== "") {
        parsedImages = JSON.parse(images);
      }
      return parsedImages;
    } catch (e) {
      return [];
    }
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <section className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#f6a13a]/30 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#2b7a78]/25 to-transparent blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${panel}`}>
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${accent}`}>Vehicles</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Choose a vehicle
                <span className={`block ${accent}`}>that matches your day.</span>
              </h1>
              <p className={`text-lg max-w-xl ${subtle}`}>
                Filter by location, dates, and type. Every listing is reviewed for quality and clarity.
              </p>
            </div>

            <div className={`rounded-[2.5rem] border p-6 ${card}`}>
              <div className="text-sm font-bold mb-4">Quick actions</div>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${panel}`}
                    onClick={action.onClick ? () => action.onClick(navigate) : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className={accent}>{action.icon}</span>
                      <div className="font-bold text-sm">{action.label}</div>
                    </div>
                    <div className={`text-xs mt-2 ${subtle}`}>{action.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`mt-10 rounded-[2.5rem] border p-6 ${card}`}>
            <form
              className="grid grid-cols-1 md:grid-cols-6 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
              }}
            >
              <div className="relative md:col-span-2">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="text"
                  placeholder="Search make or model"
                  className={`w-full h-12 pl-12 pr-4 rounded-2xl border ${panel} outline-none`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="text"
                  placeholder="Pickup location"
                  className={`w-full h-12 pl-12 pr-4 rounded-2xl border ${panel} outline-none`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div className="relative">
                <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="date"
                  className={`w-full h-12 pl-12 pr-4 rounded-2xl border ${panel} outline-none`}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              <div className="relative">
                <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="date"
                  className={`w-full h-12 pl-12 pr-4 rounded-2xl border ${panel} outline-none`}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-3">
                <select
                  className={`h-12 rounded-2xl border px-4 font-bold outline-none ${panel}`}
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="">Vehicle type</option>
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
                <button
                  type="submit"
                  className={`h-12 rounded-2xl font-bold inline-flex items-center justify-center gap-2 ${accentBg}`}
                >
                  <Search className="w-4 h-4" />
                  Find vehicles
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black">Featured vehicles</h2>
            <p className={`mt-2 ${subtle}`}>Choose from trusted owners across Rwanda.</p>
          </div>
          <Link to="/" className={`text-sm font-bold ${accent}`}>View less</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className={`col-span-3 rounded-[2.5rem] border p-12 text-center ${panel}`}>Loading vehicles...</div>
          ) : featuredVehicles.length === 0 ? (
            <div className={`col-span-3 rounded-[2.5rem] border p-12 text-center ${panel}`}>No vehicles found.</div>
          ) : (
            featuredVehicles.map((vehicle, i) => {
              const images = parseVehicleImages(vehicle.images);
              const firstImage = images && images.length > 0 ? images[0] : null;
              const imageUrl = getImageUrl(firstImage);
              const isForSale = vehicle.listing_type === "sale";
              return (
                <div key={i} className={`rounded-[2.5rem] border overflow-hidden ${card} transition hover:-translate-y-1`}>
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${panel}`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-black mb-1">{vehicle.make} {vehicle.model}</h3>
                    <p className={`text-sm mb-3 ${subtle}`}>{vehicle.type}</p>
                    <p className={`text-sm mb-4 ${subtle}`}>Location: {vehicle.locationAddress || vehicle.location || "N/A"}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className={`text-sm font-bold ${accent}`}>{vehicle.rating} rating</div>
                      <div className={`text-xs ${subtle}`}>{vehicle.reviews || 0} reviews</div>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <span className="text-2xl font-black">
                          {isForSale
                            ? formatPrice(vehicle.selling_price)
                            : formatPrice(vehicle.price ?? (vehicle as any).daily_rate ?? 0)}
                        </span>
                        <span className={`text-sm ml-2 ${subtle}`}>
                          {isForSale ? "" : "per day"}
                        </span>
                      </div>
                    </div>

                    <button
                      className={`w-full font-bold py-3 rounded-2xl transition ${vehicle.status === "Rented" || vehicle.status === "Sold"
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : accentBg
                        }`}
                      onClick={() => {
                        if (vehicle.status !== "Rented" && vehicle.status !== "Sold") {
                          navigate(`/customer/booking/${vehicle.id}`, {
                            state: { vehicle }
                          });
                        }
                      }}
                      disabled={vehicle.status === "Rented" || vehicle.status === "Sold"}
                    >
                      {vehicle.status === "Rented" ? "RENTED" : vehicle.status === "Sold" ? "SOLD" : (isForSale ? "BUY IT" : "Book Now")}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            className={`px-4 py-2 rounded-xl border font-bold ${panel} disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={pagination.currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold border ${currentPage === i + 1 ? accentBg : panel}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className={`px-4 py-2 rounded-xl border font-bold ${panel} disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black">Why choose AutoFleet Hub</h2>
          <p className={`mt-2 ${subtle}`}>Trusted by thousands of customers.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChoose.map((item, i) => (
            <div key={i} className={`rounded-3xl border p-6 text-center ${card}`}>
              <div className={`text-4xl font-black ${accent}`}>{item.value}</div>
              <div className={`text-sm mt-2 ${subtle}`}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

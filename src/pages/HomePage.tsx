import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Filter,
  ArrowRight
} from "lucide-react";
import { apiClient, STATIC_BASE_URL } from "@/services/apiClient";
import { useSettings } from "@/contexts/SettingContxt";

export default function HomePage() {
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

  const quickActions = [
    {
      label: "My Bookings",
      desc: "View active rentals",
      icon: <Car className={`w-5 h-5 ${accent}`} />,
      onClick: (nav: (path: string) => void) => nav("/customer/my-bookings"),
    },
    {
      label: "Payment Methods",
      desc: "Manage payments",
      icon: <CreditCard className={`w-5 h-5 ${accent}`} />,
      onClick: undefined,
    },
    {
      label: "Feedback",
      desc: "Rate your experience",
      icon: <MessageCircle className={`w-5 h-5 ${accent}`} />,
      onClick: undefined,
    },
    {
      label: "Support",
      desc: "Get help 24/7",
      icon: <LifeBuoy className={`w-5 h-5 ${accent}`} />,
      onClick: (nav: (path: string) => void) => nav("/customer/support"),
    },
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", String(currentPage));
      params.append("limit", "9");
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      if (vehicleType) params.append("type", vehicleType);
      if (pickupDate) params.append("pickupDate", pickupDate);
      if (returnDate) params.append("returnDate", returnDate);

      try {
        const res = await apiClient.get<any>(`/vehicles?${params.toString()}`);
        if (res && res.success && res.data && Array.isArray(res.data.vehicles)) {
          setFeaturedVehicles(res.data.vehicles);
          setPagination(res.data.pagination);
        } else {
          setFeaturedVehicles([]);
          setPagination({ currentPage: 1, totalPages: 1 });
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setFeaturedVehicles([]);
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
    let parsedImages: any[] = [];
    try {
      if (Array.isArray(images)) {
        parsedImages = parsedImages.concat(images);
      } else if (images && typeof images === "string" && images.trim() !== "") {
        parsedImages = JSON.parse(images);
      }
    } catch (e) {
      console.error("Failed to parse images:", e);
    }
    return parsedImages;
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#f6a13a]/30 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#2b7a78]/25 to-transparent blur-3xl" />

        <main className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div className="space-y-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${panel}`}>
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${accent}`}>Customer dashboard</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Find your next ride
                <span className={`block ${accent}`}>without the noise.</span>
              </h1>
              <p className={`text-lg max-w-xl ${subtle}`}>
                Search by date, location, and vehicle type. Book instantly with clear pricing and verified owners.
              </p>
            </div>
            <div className={`rounded-[2.5rem] border p-6 ${card}`}>
              <div className="text-sm font-bold mb-4">Quick actions</div>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick ? () => action.onClick(navigate) : undefined}
                    className={`rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${panel}`}
                  >
                    <div className="flex items-center gap-2">
                      {action.icon}
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
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setCurrentPage(1);
              }}
            >
              <div className="relative xl:col-span-2">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="text"
                  placeholder="Search make, model"
                  className={`w-full h-12 pl-12 pr-4 rounded-2xl border ${panel} outline-none`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${subtle}`} />
                <input
                  type="text"
                  placeholder="Location"
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
              <button type="submit" className={`h-12 rounded-2xl font-bold inline-flex items-center justify-center gap-2 ${accentBg}`}>
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </form>
          </div>
        </main>
      </div>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-black">Available fleet</h2>
          <div className={`relative rounded-2xl border ${panel}`}>
            <select
              className={`h-12 w-56 pl-4 pr-12 appearance-none bg-transparent text-sm font-bold outline-none cursor-pointer ${subtle}`}
              value={vehicleType}
              onChange={(e) => {
                setVehicleType(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All categories</option>
              <option value="suv">SUV</option>
              <option value="sedan">Sedan</option>
              <option value="van">Van</option>
              <option value="truck">Truck</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className={`w-4 h-4 rotate-90 ${subtle}`} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className={`rounded-[2.5rem] border p-12 text-center ${panel}`}>
            <div className="inline-flex items-center gap-3">
              <div className={`w-10 h-10 border-2 border-transparent border-t-current rounded-full animate-spin ${accent}`} />
              <span className="font-semibold">Loading vehicles...</span>
            </div>
          </div>
        ) : featuredVehicles.length === 0 ? (
          <div className={`rounded-[2.5rem] border p-12 text-center ${panel}`}>
            <h3 className="text-2xl font-black">No vehicles found</h3>
            <p className={`mt-2 ${subtle}`}>Try adjusting filters or search again.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle, i) => {
              const images = parseVehicleImages(vehicle.images);
              const imageUrl = getImageUrl(images[0]);
              const isForSale = vehicle.listing_type === "sale";
              return (
                <div key={i} className={`rounded-[2.5rem] border overflow-hidden ${card} transition hover:-translate-y-1`}>
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={vehicle.name}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${panel}`}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest ${accent}`}>{vehicle.make}</div>
                        <div className="text-2xl font-black">{vehicle.model}</div>
                      </div>
                      <div className={`px-3 py-2 rounded-full text-xs font-bold border ${panel}`}>
                        {Number(vehicle.rating || 0).toFixed(1)} rating
                      </div>
                    </div>

                    <div className={`text-sm ${subtle}`}>{vehicle.location_address || "Location not set"}</div>

                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-widest ${subtle}`}>
                          {isForSale ? "Price" : "Per day"}
                        </div>
                      <div className={`text-2xl font-black ${accent}`}>
                          {isForSale
                            ? formatPrice(vehicle.selling_price)
                            : formatPrice(vehicle.price ?? (vehicle as any).daily_rate ?? 0)}
                        </div>
                      </div>
                      <button
                        className={`px-5 py-3 rounded-2xl font-bold inline-flex items-center gap-2 ${accentBg}`}
                        onClick={() => navigate(`/Booking/${vehicle.id}`, { state: { vehicle } })}
                      >
                        {isForSale ? "Buy" : "Book"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <button
              className={`px-4 py-2 rounded-xl border font-bold ${panel} disabled:opacity-50`}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={pagination.currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold border ${
                  currentPage === i + 1 ? accentBg : panel
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className={`px-4 py-2 rounded-xl border font-bold ${panel} disabled:opacity-50`}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

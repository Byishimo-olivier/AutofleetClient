import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Car, CalendarCheck, MapPin, ShieldCheck, Star } from "lucide-react";
import { useSettings } from "@/contexts/SettingContxt";
import { apiClient, STATIC_BASE_URL } from "@/services/apiClient";

export default function LandingPage() {
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "3",
        });
        const res = await apiClient.get<any>(`/vehicles?${params.toString()}`);
        if (res && res.success && res.data && Array.isArray(res.data.vehicles)) {
          setFeaturedVehicles(res.data.vehicles);
        } else {
          setFeaturedVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching landing page vehicles:", error);
        setFeaturedVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

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
    } catch (error) {
      console.error("Failed to parse landing page vehicle images:", error);
    }
    return parsedImages;
  };

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#f6a13a]/30 to-transparent blur-3xl" />
        <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-[#2b7a78]/25 to-transparent blur-3xl" />

        {/* Header removed per request */}

        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="space-y-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${panel}`}>
                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${accent}`}>Rwanda Premium Rentals</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                Your next vehicle
                <span className={`block ${accent}`}>in three calm clicks.</span>
              </h1>
              <p className={`text-lg max-w-xl ${subtle}`}>
                Book clean, verified vehicles with transparent pricing and instant confirmation. Built for busy people who want a smooth ride, not a hassle.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/home" className={`px-6 py-3 rounded-2xl font-bold inline-flex items-center gap-3 ${accentBg}`}>
                  Browse Vehicles
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/Vehicles" className={`px-6 py-3 rounded-2xl font-bold border ${panel}`}>
                  View All Deals
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { label: "Verified owners", value: "350+" },
                  { label: "Average rating", value: "4.8" },
                  { label: "Support", value: "24/7" }
                ].map((stat, idx) => (
                  <div key={idx} className={`rounded-2xl border px-4 py-3 ${panel}`}>
                    <div className="text-xl font-black">{stat.value}</div>
                    <div className={`text-xs ${subtle}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[2.5rem] border p-4 ${card}`}>
              <div className="relative rounded-[2rem] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1400"
                  alt="Premium SUV"
                  className="h-[420px] w-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl px-4 py-3 border ${panel}`}>
                    <div className="text-xs font-semibold">Starting at</div>
                    <div className="text-lg font-black">RWF 25,000/day</div>
                  </div>
                  <div className={`rounded-2xl px-4 py-3 border ${panel}`}>
                    <div className="text-xs font-semibold">Instant confirmation</div>
                    <div className="text-lg font-black">No waiting</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <section id="how" className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: "Choose location", body: "Pick a pickup spot and delivery time that fits your plan." },
            { icon: Car, title: "Select vehicle", body: "Filter by type, price, and verified owner ratings." },
            { icon: CalendarCheck, title: "Confirm & go", body: "Secure payment and a fast handover." }
          ].map((step, idx) => (
            <div key={idx} className={`rounded-3xl border p-6 ${card}`}>
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${panel}`}>
                {React.createElement(step.icon, { className: `h-6 w-6 ${accent}` })}
              </div>
              <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
              <p className={`mt-2 ${subtle}`}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="fleet" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-black">Popular picks</h2>
          <Link to="/Vehicles" className={`text-sm font-bold ${accent}`}>See full fleet</Link>
        </div>
        {loading ? (
          <div className={`rounded-[2.5rem] border p-12 text-center ${panel}`}>Loading vehicles...</div>
        ) : featuredVehicles.length === 0 ? (
          <div className={`rounded-[2.5rem] border p-12 text-center ${panel}`}>No vehicles found.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredVehicles.map((vehicle, idx) => {
              const images = parseVehicleImages(vehicle.images);
              const imageUrl = getImageUrl(images[0]);
              const isForSale = vehicle.listing_type === "sale";

              return (
                <div key={idx} className={`rounded-[2rem] border overflow-hidden ${card} transition hover:-translate-y-1`}>
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-56 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${panel}`}>
                        {vehicle.status || "Available"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className={`text-xs font-semibold ${subtle}`}>
                      {vehicle.type || "Vehicle"}
                    </div>
                    <div className="mt-3 text-2xl font-black">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className={`mt-2 text-sm ${subtle}`}>
                      {vehicle.locationAddress || vehicle.location_address || vehicle.location || "Location not set"}
                    </div>
                    <div className={`mt-3 ${accent} font-bold`}>
                      {isForSale
                        ? formatPrice(vehicle.selling_price ?? 0)
                        : `${formatPrice(vehicle.price ?? vehicle.daily_rate ?? 0)}/day`}
                    </div>
                    <div className={`mt-4 inline-flex items-center gap-2 text-sm ${subtle}`}>
                      <Star className={`h-4 w-4 ${accent}`} /> Rated {Number(vehicle.rating || 0).toFixed(1)}
                    </div>
                    <button
                      className={`mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${accentBg}`}
                      onClick={() => navigate(`/Booking/${vehicle.id}`, { state: { vehicle } })}
                    >
                      {isForSale ? "Buy now" : "Book now"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section id="trust" className="max-w-7xl mx-auto px-6 pb-20">
        <div className={`rounded-[2.5rem] border p-10 ${card} relative overflow-hidden`}>
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-[#f6a13a]/30 to-transparent blur-2xl" />
          <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black">Built on trust</h2>
              <p className={`mt-4 ${subtle}`}>
                Verified owners, secure payments, and real-time support so your journey always stays on track.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {["Verified owners", "Secure payments", "Smart insurance"].map((item) => (
                  <span key={item} className={`px-4 py-2 rounded-full text-xs font-bold border ${panel}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className={`rounded-3xl border p-6 ${panel}`}>
              <ShieldCheck className={`h-8 w-8 ${accent}`} />
              <div className="mt-4 text-2xl font-black">Protection by default</div>
              <p className={`mt-2 ${subtle}`}>Every booking includes our safety checks and support hotline.</p>
              <Link to="/home" className={`mt-6 inline-flex items-center gap-2 font-bold ${accent}`}>
                Start booking
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

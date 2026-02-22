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
import { useSettings } from '@/contexts/SettingContxt';

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

    // Neumorphic Core Variables
    const bgClass = isDark ? "bg-[#21232c] text-gray-200" : "bg-[#e0e5ec] text-gray-700";

    const neuCardFlat = isDark
        ? "bg-[#21232c] shadow-[8px_8px_16px_#14151a,-8px_-8px_16px_#2e313e]"
        : "bg-[#e0e5ec] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]";

    const neuCardInset = isDark
        ? "bg-[#21232c] shadow-[inset_8px_8px_16px_#14151a,inset_-8px_-8px_16px_#2e313e]"
        : "bg-[#e0e5ec] shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]";

    const neuButtonHoverShadow = isDark
        ? "hover:shadow-[inset_4px_4px_8px_#14151a,inset_-4px_-4px_8px_#2e313e]"
        : "hover:shadow-[inset_4px_4px_8px_0_rgba(163,177,198,0.7),inset_-4px_-4px_8px_0_rgba(255,255,255,0.8)]";

    const neuButtonActiveShadow = isDark
        ? "active:shadow-[inset_6px_6px_10px_#14151a,inset_-6px_-6px_10px_#2e313e]"
        : "active:shadow-[inset_6px_6px_10px_0_rgba(163,177,198,0.7),inset_-6px_-6px_10px_0_rgba(255,255,255,0.8)]";

    const neuButton = `
        px-6 py-3 rounded-2xl font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2
        ${neuCardFlat}
        ${neuButtonHoverShadow}
        ${neuButtonActiveShadow}
        ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'}
        ${isDark ? 'text-gray-300' : 'text-gray-700'}
    `.trim();

    const inputNeuStyle = `w-full h-14 pl-12 pr-4 rounded-2xl font-medium outline-none transition-all ${neuCardInset} ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-500'
        }`;

    const quickActions = [
        {
            label: "My Bookings",
            desc: "View active rentals",
            icon: <Car className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />,
            onClick: (nav: (path: string) => void) => nav("/customer/my-bookings"),
        },
        {
            label: "Payment Methods",
            desc: "Manage payments",
            icon: <CreditCard className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />,
            onClick: undefined,
        },
        {
            label: "Feedback",
            desc: "Rate your experience",
            icon: <MessageCircle className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />,
            onClick: undefined,
        },
        {
            label: "Support",
            desc: "Get help 24/7",
            icon: <LifeBuoy className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />,
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
        if (!img) return 'https://placehold.co/600x400?text=No+Image';
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        const normalizedImg = img.startsWith("/") ? img : `/${img}`;
        return `${STATIC_BASE_URL}${normalizedImg}`;
    };

    const parseVehicleImages = (images: any) => {
        let parsedImages: any[] = [];
        try {
            if (Array.isArray(images)) {
                parsedImages = parsedImages.concat(images);
            } else if (images && typeof images === 'string' && images.trim() !== '') {
                parsedImages = JSON.parse(images);
            }
        } catch (e) {
            console.error("Failed to parse images:", e);
        }
        return parsedImages;
    };

    return (
        <div className={`min-h-screen pb-24 pt-28 font-sans ${bgClass}`}>

            <main className="max-w-7xl mx-auto px-6 space-y-20">

                {/* Header Area */}
                <div className="flex flex-col gap-6 pt-4">
                    <div className={`inline-flex items-center px-5 py-2.5 rounded-full w-fit ${neuCardInset}`}>
                        <span className={`text-sm font-bold tracking-widest uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            Customer Portal
                        </span>
                    </div>
                    <h1 className={`text-5xl lg:text-6xl font-black tracking-tight leading-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        Dashboard
                    </h1>
                    <p className="text-xl font-medium max-w-2xl">
                        Find and reserve your premium vehicle effortlessly with our soft tactile interface.
                    </p>
                </div>

                {/* Neumorphic Filter Panel */}
                <div className={`p-8 md:p-10 rounded-[2.5rem] ${neuCardFlat}`}>
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6"
                        onSubmit={e => { e.preventDefault(); setCurrentPage(1); }}
                    >
                        {/* Search Field */}
                        <div className="relative xl:col-span-2">
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} z-10`} />
                            <input
                                type="text"
                                placeholder="Search make, model..."
                                className={inputNeuStyle}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Location Field */}
                        <div className="relative xl:col-span-1">
                            <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} z-10`} />
                            <input
                                type="text"
                                placeholder="Location"
                                className={inputNeuStyle}
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>

                        {/* Date Fields Container */}
                        <div className={`flex items-center xl:col-span-2 rounded-2xl px-4 h-14 ${neuCardInset}`}>
                            <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} mr-3 shrink-0`} />
                            <div className="flex-1 flex items-center justify-between min-w-0 h-full">
                                <input
                                    type="date"
                                    className={`w-full h-full bg-transparent text-sm font-bold focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'} [color-scheme:dark] dark:[color-scheme:dark]`}
                                    value={pickupDate}
                                    onChange={e => setPickupDate(e.target.value)}
                                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                />
                                <div className={`w-[2px] h-6 mx-3 shrink-0 rounded-full ${isDark ? 'bg-[#14151a]' : 'bg-[#a3b1c6]'}`} />
                                <input
                                    type="date"
                                    className={`w-full h-full bg-transparent text-sm font-bold focus:outline-none ${isDark ? 'text-white' : 'text-gray-900'} [color-scheme:dark] dark:[color-scheme:dark]`}
                                    value={returnDate}
                                    onChange={e => setReturnDate(e.target.value)}
                                    style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`h-14 xl:col-span-1 ${neuButton} ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                        >
                            <Filter className="w-5 h-5" />
                            Filter
                        </button>
                    </form>
                </div>

                {/* Quick Actions Board */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={action.onClick ? () => action.onClick(navigate) : undefined}
                            className={`group p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 text-center transition-all ${neuCardFlat} ${neuButtonHoverShadow} ${neuButtonActiveShadow}`}
                        >
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${neuCardInset}`}>
                                {action.icon}
                            </div>
                            <div>
                                <h3 className={`font-bold text-xl mb-2 ${isDark ? 'group-hover:text-blue-400' : 'group-hover:text-blue-600'} transition-colors ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                    {action.label}
                                </h3>
                                <p className="text-sm font-medium">{action.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Vehicle Grid Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10">
                    <h2 className={`text-4xl font-black ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        Available Fleet
                    </h2>
                    <div>
                        <div className={`relative rounded-2xl overflow-hidden ${neuCardInset}`}>
                            <select
                                className={`h-14 w-56 pl-6 pr-12 appearance-none bg-transparent text-sm font-bold focus:outline-none cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'
                                    }`}
                                value={vehicleType}
                                onChange={(e) => {
                                    setVehicleType(e.target.value);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="" className={isDark ? "bg-[#21232c]" : "bg-[#e0e5ec]"}>All Categories</option>
                                <option value="suv" className={isDark ? "bg-[#21232c]" : "bg-[#e0e5ec]"}>SUV</option>
                                <option value="sedan" className={isDark ? "bg-[#21232c]" : "bg-[#e0e5ec]"}>Sedan</option>
                                <option value="van" className={isDark ? "bg-[#21232c]" : "bg-[#e0e5ec]"}>Van</option>
                                <option value="truck" className={isDark ? "bg-[#21232c]" : "bg-[#e0e5ec]"}>Truck</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronRight className={`w-5 h-5 rotate-90 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${neuCardInset}`}>
                            <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin ${isDark ? 'border-blue-400' : 'border-blue-600'}`} />
                        </div>
                        <p className="font-bold text-lg animate-pulse">Loading premium fleet...</p>
                    </div>
                ) : featuredVehicles.length === 0 ? (
                    <div className={`py-32 text-center rounded-[3rem] ${neuCardInset}`}>
                        <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 ${neuCardFlat}`}>
                            <Car className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                        <h3 className={`text-3xl font-black mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>No vehicles found</h3>
                        <p className="text-xl font-medium">Try adjusting your filters to see more luxury options.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                        {featuredVehicles.map((vehicle, i) => {
                            const images = parseVehicleImages(vehicle.images);
                            const imageUrl = getImageUrl(images[0]);
                            const isForSale = vehicle.listing_type === "sale";

                            return (
                                <div key={i} className={`flex flex-col rounded-[2.5rem] p-6 gap-6 transition-all duration-300 ${neuCardFlat} hover:-translate-y-2`}>

                                    {/* Image Container */}
                                    <div className={`relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden p-3 ${neuCardInset}`}>
                                        <img
                                            src={imageUrl}
                                            alt={vehicle.name}
                                            className="w-full h-full object-cover rounded-xl"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image'; }}
                                        />

                                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none z-10">
                                            <span className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${neuCardFlat} ${vehicle.status === "Available"
                                                    ? "text-emerald-500"
                                                    : "text-rose-500"
                                                }`}>
                                                {vehicle.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="flex-1 flex flex-col px-2">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {vehicle.make}
                                                </span>
                                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${neuCardInset}`}>
                                                    ⭐ {Number(vehicle.rating).toFixed(1)}
                                                </span>
                                            </div>

                                            <h3 className={`text-2xl font-black mb-6 leading-tight ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                                {vehicle.model}
                                                <span className="ml-3 text-lg font-bold text-gray-500">
                                                    {vehicle.year}
                                                </span>
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold mb-8">
                                                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl ${neuCardInset}`}>
                                                    <Car className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                                    {vehicle.type}
                                                </span>
                                                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-1 min-w-[120px] ${neuCardInset}`}>
                                                    <MapPin className={`w-4 h-4 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                                    <span className="truncate">{vehicle.location_address || 'Unspecified'}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer / CTA */}
                                        <div className="flex items-center justify-between pt-4">
                                            <div>
                                                <p className="text-xs font-extrabold uppercase tracking-widest mb-1 text-gray-400">
                                                    {isForSale ? "Price" : "Per Day"}
                                                </p>
                                                <p className={`text-2xl font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    {isForSale ? formatPrice(vehicle.selling_price) : formatPrice(vehicle.price)}
                                                </p>
                                            </div>

                                            <button
                                                className={`px-8 py-4 ${neuButton} text-lg ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
                                                onClick={() => navigate(`/Booking/${vehicle.id}`, { state: { vehicle } })}
                                            >
                                                {isForSale ? "Buy" : "Book"} <ArrowRight className="w-5 h-5 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-6 mt-20">
                        <button
                            className={`p-4 rounded-xl disabled:opacity-50 disabled:shadow-none ${neuCardFlat} ${neuButtonHoverShadow} ${neuButtonActiveShadow}`}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={pagination.currentPage === 1}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className={`flex gap-3 p-3 rounded-2xl ${neuCardInset}`}>
                            {Array.from({ length: pagination.totalPages }, (_, i) => {
                                const isCurrent = currentPage === i + 1;
                                return (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${isCurrent
                                                ? `${neuCardInset} ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                                                : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            className={`p-4 rounded-xl disabled:opacity-50 disabled:shadow-none ${neuCardFlat} ${neuButtonHoverShadow} ${neuButtonActiveShadow}`}
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                            disabled={pagination.currentPage === pagination.totalPages}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
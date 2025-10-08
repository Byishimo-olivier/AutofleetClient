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
} from "lucide-react";
import { apiClient } from "@/services/apiClient";

// Get base URL without /api for static files
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

const quickActions = [
    {
        label: "My Bookings",
        desc: "View active rentals",
        color: "bg-green-600",
        icon: <Car className="w-6 h-6" />,
        onClick: (navigate: (path: string) => void) => navigate("/customer/my-bookings"),
    },
    {
        label: "Payment Methods",
        desc: "Manage payments",
        color: "bg-purple-600",
        icon: <CreditCard className="w-6 h-6" />,
        onClick: undefined,
    },
    {
        label: "Feedback & Ratings",
        desc: "Rate your experience",
        color: "bg-orange-500",
        icon: <MessageCircle className="w-6 h-6" />,
        onClick: undefined,
    },
    {
        label: "Support",
        desc: "Get help 24/7",
        color: "bg-red-600",
        icon: <LifeBuoy className="w-6 h-6" />,
        onClick: (navigate: (path: string) => void) => navigate("/customer/support"),
    },
];

const whyChoose = [
    { value: "500+", label: "Vehicles Available", color: "text-blue-600" },
    { value: "10K+", label: "Happy Customers", color: "text-green-600" },
    { value: "4.8", label: "Average Rating", color: "text-orange-500" },
    { value: "24/7", label: "Customer Support", color: "text-purple-600" },
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

    useEffect(() => {
        const fetchFeatured = async () => {
            setLoading(true);
            // Build query string
            const params = new URLSearchParams();
            params.append("page", String(currentPage));
            params.append("limit", "3");
            if (search) params.append("search", search);
            if (location) params.append("location", location);
            if (vehicleType) params.append("type", vehicleType);
            if (pickupDate) params.append("pickupDate", pickupDate);
            if (returnDate) params.append("returnDate", returnDate);

            const res = await apiClient.get<any>(`/vehicles/featured?${params.toString()}`);
            if (res && res.success && res.data && Array.isArray(res.data.vehicles)) {
                setFeaturedVehicles(res.data.vehicles);
                setPagination(res.data.pagination);
            } else {
                setFeaturedVehicles([]);
                setPagination({ currentPage: 1, totalPages: 1 });
            }
            setLoading(false);
        };
        fetchFeatured();
    }, [currentPage, search, location, vehicleType, pickupDate, returnDate]);

    // Updated helper function to construct image URLs correctly
    const getImageUrl = (img: string | null | undefined) => {
        if (!img) return "/placeholder.png";
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        // Always ensure a single leading slash
        const normalizedImg = img.startsWith("/") ? img : `/${img}`;
        return `${STATIC_BASE_URL}${normalizedImg}`;
    };

    const parseVehicleImages = (images: any, vehicleId: string) => {
        let parsedImages = [];
        try {
            if (Array.isArray(images)) {
                parsedImages = images;
            } else if (images && typeof images === 'string' && images.trim() !== '') {
                parsedImages = JSON.parse(images);
            } else {
                parsedImages = [];
            }
            return parsedImages;
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section with Search */}
            <section className="bg-gradient-to-br from-[#2c4a9d] to-[#1e3a7d] text-white py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-3">Find Your Perfect Ride</h1>
                        <p className="text-blue-100 text-lg">
                            Choose from thousands of vehicles, book instantly, and drive away with confidence
                        </p>
                    </div>

                    {/* Search Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
                        <form
                            className="grid grid-cols-1 md:grid-cols-6 gap-4"
                            onSubmit={e => {
                                e.preventDefault();
                                setCurrentPage(1);
                            }}
                        >
                            {/* Search input */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search (make, model, etc)"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {/* Pickup Location */}
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Pickup Location"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                            {/* Pickup Date */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    placeholder="mm/dd/yyyy"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={pickupDate}
                                    onChange={e => setPickupDate(e.target.value)}
                                />
                            </div>
                            {/* Return Date */}
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    placeholder="mm/dd/yyyy"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={returnDate}
                                    onChange={e => setReturnDate(e.target.value)}
                                />
                            </div>
                            {/* Vehicle Type and Button stacked vertically in the same column */}
                            <div className="flex flex-col md:col-span-1 lg:col-span-1">
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={vehicleType}
                                    onChange={e => setVehicleType(e.target.value)}
                                >
                                    <option value="">Vehicle Type</option>
                                    <option value="suv">SUV</option>
                                    <option value="sedan">Sedan</option>
                                    <option value="van">Van</option>
                                    <option value="truck">Truck</option>
                                </select>
                                <button
                                    type="submit"
                                    className="bg-[#2c4a9d] hover:bg-[#1e3a7d] text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2 mt-3"
                                >
                                    <Search className="w-5 h-5" />
                                    Find Vehicle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            className={`${action.color} text-white rounded-xl shadow-lg hover:shadow-xl transition p-8 flex flex-col items-center gap-4 mt-13`}
                            onClick={action.onClick ? () => action.onClick(navigate) : undefined}
                        >
                            <div className="bg-white/20 rounded-lg p-4 mb-2">
                                {action.icon}
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg mb-2">{action.label}</div>
                                <div className="text-sm opacity-90">{action.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Featured Vehicles */}
            <section className="max-w-6xl mx-auto px-4 mt-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Vehicles</h2>
                    <p className="text-gray-600">
                        Choose from our premium fleet of well-maintained vehicles
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-3 text-center text-gray-500 py-12">Loading vehicles...</div>
                    ) : featuredVehicles.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500 py-12">No vehicles found.</div>
                    ) : (
                        featuredVehicles.map((vehicle, i) => {
                            const imageUrl = getImageUrl(vehicle.img);
                            const images = parseVehicleImages(vehicle.images, vehicle.id);
                            const firstImage = images && images.length > 0 ? images[0] : null;
                            const isForSale = vehicle.listing_type === "sale";
                            return (
                                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(vehicle.img)}
                                            alt={vehicle.name}
                                            className="w-full h-56 object-cover"
                                            onError={e => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
                                        />
                                        <span
                                            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                                                vehicle.status === "Available"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {vehicle.status}
                                        </span>
                                    </div>

                                    {/* Vehicle Info */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{vehicle.name}</h3>
                                        <p className="text-gray-500 text-sm mb-3">{vehicle.type}</p>

                                        {/* Rating */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex text-yellow-400">
                                                {Array(5)
                                                    .fill(0)
                                                    .map((_, idx) => (
                                                        <span key={idx} className={idx < Math.round(vehicle.rating) ? "" : "text-gray-300"}>
                                                            ★
                                                        </span>
                                                    ))}
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {vehicle.rating} ({vehicle.reviews} reviews)
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <span className="text-3xl font-bold text-gray-800">
                                                    {isForSale ? `$${vehicle.selling_price}` : `$${vehicle.price}`}
                                                </span>
                                                <span className="text-gray-500 text-sm ml-1">
                                                    {isForSale ? "" : "per day"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            className="w-full bg-[#2c4a9d] hover:bg-[#1e3a7d] text-white font-semibold py-3 rounded-lg transition shadow-md"
                                            onClick={() => navigate(`/customer/booking/${vehicle.id}`, { 
                                                state: { vehicle } 
                                            })}
                                        >
                                            {isForSale ? "BUY IT" : "Book Now"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-10">
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={pagination.currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: pagination.totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-lg font-semibold transition ${
                                    currentPage === i + 1
                                        ? "bg-[#2c4a9d] text-white"
                                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                        disabled={pagination.currentPage === pagination.totalPages}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose AutoFleet Hub?</h2>
                    <p className="text-gray-600">
                        Trusted by thousands of customers worldwide
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {whyChoose.map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition">
                                <div className={`text-5xl font-bold mb-2 ${item.color}`}>
                                    {item.value}
                                </div>
                                <div className="text-gray-600 font-medium">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
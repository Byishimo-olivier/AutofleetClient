import React, { useState } from "react";
import { MapPin, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSettings } from '@/contexts/SettingContxt';

const allVehicles = [
  {
    id: "1",
    name: "Toyota Corolla",
    price: 45,
    type: "Sedan",
    transmission: "Automatic",
    status: "Available",
    img: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg",
    rating: 4.8,
    reviews: 127,
  },
  {
    id: "2",
    name: "Volkswagen",
    price: 48,
    type: "Sedan",
    transmission: "Automatic",
    status: "Available",
    img: "https://cdn.pixabay.com/photo/2016/11/29/09/32/auto-1868726_1280.jpg",
    rating: 4.7,
    reviews: 122,
  },
  {
    id: "3",
    name: "Range Rover",
    price: 90,
    type: "SUV",
    transmission: "Automatic",
    status: "Booked",
    img: "https://cdn.pixabay.com/photo/2015/01/19/13/51/car-604019_1280.jpg",
    rating: 4.9,
    reviews: 98,
  },
  {
    id: "4",
    name: "Honda CRV",
    price: 60,
    type: "SUV",
    transmission: "Automatic",
    status: "Available",
    img: "https://cdn.pixabay.com/photo/2017/01/06/19/15/honda-1957037_1280.jpg",
    rating: 4.6,
    reviews: 110,
  },
  {
    id: "5",
    name: "Toyota Hiace",
    price: 70,
    type: "Van",
    transmission: "Manual",
    status: "Available",
    img: "https://cdn.pixabay.com/photo/2013/07/12/15/55/van-150270_1280.png",
    rating: 4.5,
    reviews: 80,
  },
  // ...add more vehicles as needed
];

const vehicleTypes = ["All", "SUV", "Sedan", "Van"];
const transmissions = ["All", "Automatic", "Manual"];

const ITEMS_PER_PAGE = 6;

export default function VehiclesPage() {
  const { settings, formatPrice, t } = useSettings();
  
  const [type, setType] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filtered = allVehicles.filter(v =>
    (type === "All" || v.type === type) &&
    (transmission === "All" || v.transmission === transmission) &&
    (v.name.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const vehicles = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className={settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}>
      {/* Filter/Search Bar */}
      <section className="bg-gradient-to-br from-[#2c4a9d] to-[#1e3a7d] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Browse Vehicles</h1>
            <p className="text-blue-100 text-lg">Find the perfect vehicle for your needs</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={e => { setType(e.target.value); setCurrentPage(1); }}
              >
                {vehicleTypes.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={transmission}
                onChange={e => { setTransmission(e.target.value); setCurrentPage(1); }}
              >
                {transmissions.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Pickup Date"
              />
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Return Date"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Listings */}
      <section className="max-w-6xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12 text-lg">
              No vehicles found.
            </div>
          )}
          {vehicles.map((vehicle, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              {/* Status Badge */}
              <div className="relative">
                <img
                  src={vehicle.img}
                  alt={vehicle.name}
                  className="w-full h-56 object-cover"
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
                <p className="text-gray-500 text-sm mb-3">{vehicle.type} • {vehicle.transmission}</p>
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
                    <span className="text-3xl font-bold text-gray-800">${vehicle.price}</span>
                    <span className="text-gray-500 text-sm ml-1">per day</span>
                  </div>
                </div>
                {/* Book Button */}
                <button
                  className="w-full bg-[#2c4a9d] hover:bg-[#1e3a7d] text-white font-semibold py-3 rounded-lg transition shadow-md"
                  // onClick={() => navigate(`/customer/booking/${vehicle.id}`)}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-semibold transition ${
                  currentPage === page
                    ? "bg-[#2c4a9d] text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
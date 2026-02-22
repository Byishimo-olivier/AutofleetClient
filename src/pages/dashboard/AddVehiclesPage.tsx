import { useEffect, useState } from 'react';
import { Car, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { apiClient, STATIC_BASE_URL } from "@/services/apiClient";
import { aiService } from '@/services/aiService';

import { useSettings } from '@/contexts/SettingContxt';
import { useAuth } from '@/contexts/AuthContext';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  type: string;
  status: string;
  bookings: number;
  daily_rate: number; // keep as daily_rate
  license_plate: string;
  images?: string[]; // <-- Add this line
  locationAddress?: string;
  locationLat?: string;
  locationLng?: string;
  location_lat?: string;
  location_lng?: string;
}

interface VehicleForm {
  make: string;
  model: string;
  year: string;
  plateNumber: string;
  category: string;
  color: string;
  seats: string;
  transmission: string;
  fuelType: string;
  dailyRate: string;
  description: string;
  features: string;
  images: File[];
  locationLat: string;
  locationLng: string;
  locationAddress: string;
  listing_type: string;
  selling_price: string;
}

const initialForm: VehicleForm = {
  make: '',
  model: '',
  year: '',
  plateNumber: '',
  category: '',
  color: '',
  seats: '',
  transmission: 'automatic',
  fuelType: 'gasoline',
  dailyRate: '',
  description: '',
  features: '',
  images: [],
  locationLat: '',
  locationLng: '',
  locationAddress: '',
  listing_type: 'rent',
  selling_price: '',
};

const VehiclesPage: React.FC = () => {
  const { settings, formatPrice, t } = useSettings();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<VehicleForm>(initialForm);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [generatingDescription, setGeneratingDescription] = useState(false);


  useEffect(() => {
    fetchVehicles();
  }, []);

  // Update fetchVehicles to use filters
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All Categories') params.append('category', category.toLowerCase());
      if (status && status !== 'All Status') params.append('status', status.toLowerCase());
      // Add owner filter to only show vehicles owned by current user
      params.append('ownerOnly', 'true');
      const response = await apiClient.get(`/vehicles?${params.toString()}&userId=${encodeURIComponent(String(user?.id))}`);
      const data = response.data as { vehicles: Vehicle[] };
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [search, category, status]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm(prev => ({ ...prev, images: files as File[] }));
      setUploadError(null);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // 1️⃣ Prepare features array
    const featuresArr = form.features
      ? form.features.split(',').map(f => f.trim()).filter(Boolean)
      : [];

    // 2️⃣ Prepare vehicle data
    const vehicleData = {
      make: form.make.trim(),
      model: form.model.trim(),
      year: form.year.trim(),
      category: form.category.toLowerCase(),
      plateNumber: form.plateNumber.trim(),
      color: form.color.trim(),
      seats: form.seats.trim(),
      transmission: form.transmission.trim(),
      fuelType: form.fuelType.trim(),
      description: form.description.trim(),
      features: featuresArr,
      locationLat: form.locationLat.trim(),
      locationLng: form.locationLng.trim(),
      locationAddress: form.locationAddress.trim(),
      listing_type: form.listing_type.trim(),
      selling_price: form.selling_price.trim(),
      daily_rate: form.dailyRate.trim(),
      status: 'available', // <-- ADD THIS LINE
    };

    try {
      let vehicleId = editingId;
      if (editingId) {
        // Edit mode: update vehicle
        await apiClient.put(`/vehicles/${editingId}`, vehicleData);
      } else {
        // Add mode: create vehicle
        const res: any = await apiClient.post('/vehicles', vehicleData);
        vehicleId =
          res.data?.data?.vehicleId ||
          res.data?.vehicleId ||
          res.data?.id ||
          res.vehicleId ||
          null;
        if (!vehicleId) throw new Error('Vehicle ID not returned from backend.');
      }

      // Upload images if any (optional: only on add or always)
      if (form.images.length > 0 && vehicleId) {
        const imgForm = new FormData();
        form.images.forEach((file) => {
          imgForm.append('images', file);
        });
        await apiClient.post(`/vehicle-images/upload/${vehicleId}`, imgForm);
      }

      setShowModal(false);
      setForm(initialForm);
      setEditingId(null); // Reset edit mode
      setSuccessMessage(editingId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchVehicles();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add/update vehicle. Please check your input.';
      setUploadError(errorMsg);
      console.error('Add/update vehicle error:', err);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setUploadError('Geolocation is not supported by your browser.');
      return;
    }
    setUploadError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          locationLat: position.coords.latitude.toString(),
          locationLng: position.coords.longitude.toString(),
        }));
      },
      (error) => {
        setUploadError('Unable to retrieve your location.');
      }
    );
  };

  const handleToggleStatus = async (vehicle: Vehicle) => {
    const newStatus = vehicle.status === 'available' ? 'inactive' : 'available';
    try {
      await apiClient.put(`/vehicles/${vehicle.id}`, { status: newStatus });
      fetchVehicles(); // Refresh list
    } catch (err) {
      alert('Failed to update vehicle status.');
    }
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await apiClient.delete(`/vehicles/${vehicleId}`);
      fetchVehicles();
    } catch (err) {
      alert("Failed to delete vehicle.");
    }
  };

  const handleAiGenerate = async () => {

    if (!form.make || !form.model || !form.year) {
      setUploadError('Please enter make, model, and year first to generate a description.');
      return;
    }

    setGeneratingDescription(true);
    try {
      const description = await aiService.generateDescription({
        make: form.make,
        model: form.model,
        year: form.year,
        features: form.features
      });

      if (description) {
        setForm(prev => ({ ...prev, description }));
      } else {
        setUploadError('AI generation failed. Please try again.');
      }
    } catch (err) {
      console.error('AI Generate Error:', err);
      setUploadError('AI service error.');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {

    const v = vehicle as any; // Cast to access additional DB fields that might not be in the TS interface
    setForm({
      ...initialForm,
      make: v.make || '',
      model: v.model || '',
      year: v.year ? String(v.year) : '',
      plateNumber: v.license_plate || '',
      category: v.type || v.category || '',
      color: v.color || '',
      seats: v.seats ? String(v.seats) : '',
      transmission: v.transmission || 'automatic',
      fuelType: v.fuel_type || v.fuelType || 'gasoline',
      dailyRate: v.daily_rate ? String(v.daily_rate) : '',
      description: v.description || '',
      features: v.features ? (Array.isArray(v.features) ? v.features.join(', ') : v.features) : '',
      images: [], // Images are handled separately via upload
      locationLat: v.location_lat || v.locationLat || '',
      locationLng: v.location_lng || v.locationLng || '',
      locationAddress: v.locationAddress || '',
      listing_type: v.listing_type || 'rent',
      selling_price: v.selling_price ? String(v.selling_price) : '',
    });
    setEditingId(vehicle.id); // <-- Track which vehicle is being edited
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className={`text-lg ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            Loading vehicles...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Vehicle Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your fleet of vehicles</p>
        </div>
        <button
          className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center"
          onClick={() => {
            setForm(initialForm);
            setEditingId(null);
            setShowModal(true);
          }}
        >
          <Car className="w-5 h-5 mr-2" /> Add Vehicle
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6">
        <input
          type="text"
          placeholder="Search vehicles..."
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 sm:flex-none"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>Sedan</option>
          <option>SUV</option>
          <option>Van</option>
          <option>Truck</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 sm:flex-none"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          <option>All Status</option>
          <option>Available</option>
          <option>Rented</option>
          <option>Maintenance</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bookings</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Price/Day</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">Loading vehicles...</td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No vehicles found.</td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-16 h-12 bg-gray-300 rounded-lg mr-3 overflow-hidden flex items-center justify-center">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img
                          src={
                            vehicle.images[0].startsWith('http://') || vehicle.images[0].startsWith('https://')
                              ? vehicle.images[0]
                              : `${STATIC_BASE_URL}/${vehicle.images[0].replace(/^\/+/, '')}`
                          }
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                          }}
                        />
                      ) : (
                        <Car className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-xs text-gray-500">{vehicle.license_plate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vehicle.type ? vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1) : ''}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicle.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : vehicle.status === 'rented'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                      {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{vehicle.bookings || 0}</td>
                  <td className="px-6 py-4 text-gray-700">${vehicle.daily_rate}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div>{vehicle.locationAddress}</div>
                    {/* GPS Navigation Button under location */}
                    {(vehicle.locationLat || vehicle.location_lat) && (vehicle.locationLng || vehicle.location_lng) && (
                      <button
                        className="mt-1 flex items-center gap-1 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        title="Navigate to Vehicle Location"
                        onClick={() => {
                          const lat = vehicle.locationLat || vehicle.location_lat;
                          const lng = vehicle.locationLng || vehicle.location_lng;
                          const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                          window.open(url, '_blank');
                        }}
                      >
                        GPS Navigate
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      className="text-blue-600 hover:underline text-xs"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-xs"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      Delete
                    </button>
                    <button
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded 
                        ${vehicle.status === 'available' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                      onClick={() => handleToggleStatus(vehicle)}
                      title={vehicle.status === 'available' ? 'Mark as Unavailable' : 'Mark as Available'}
                    >
                      {vehicle.status === 'available' ? (
                        <>
                          <XCircle className="w-4 h-4" /> Unavailable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" /> Available
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4">
        <nav className="inline-flex rounded-md shadow-sm">
          <button className="px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-l hover:bg-gray-100">1</button>
          <button className="px-3 py-1 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-100">2</button>
          <button className="px-3 py-1 border border-gray-300 bg-white text-gray-700 rounded-r hover:bg-gray-100">3</button>
        </nav>
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-4 md:p-8 relative m-4"
            style={{ boxSizing: 'border-box' }}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => {
                setShowModal(false);
                setForm(initialForm);
                setUploadError(null);
                setEditingId(null); // Reset edit mode
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">Add New Vehicle</h2>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleAddVehicle}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium mb-1">Make *</label>
                  <input
                    name="make"
                    value={form.make}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
                {/* Model */}
                <div>
                  <label className="block text-sm font-medium mb-1">Model *</label>
                  <input
                    name="model"
                    value={form.model}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., Corolla"
                    required
                  />
                </div>
                {/* Year */}
                <div>
                  <label className="block text-sm font-medium mb-1">Year *</label>
                  <input
                    name="year"
                    type="number"
                    min="1900"
                    max="2030"
                    value={form.year}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., 2022"
                    required
                  />
                </div>
                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium mb-1">Plate Number *</label>
                  <input
                    name="plateNumber"
                    value={form.plateNumber}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., RAC 007D"
                    required
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>
                {/* Color */}
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., Red"
                  />
                </div>
                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium mb-1">Seats</label>
                  <input
                    name="seats"
                    type="number"
                    min="1"
                    max="12"
                    value={form.seats}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., 5"
                  />
                </div>
                {/* Transmission */}
                <div>
                  <label className="block text-sm font-medium mb-1">Transmission</label>
                  <select
                    name="transmission"
                    value={form.transmission}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={form.fuelType}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                {/* Listing Type */}
                <div>
                  <label className="block text-sm font-medium mb-1">Listing Type *</label>
                  <select
                    name="listing_type"
                    value={form.listing_type}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    required
                  >
                    <option value="rent">Rent</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                {/* Features */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
                  <input
                    name="features"
                    value={form.features}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., Air Conditioning, Bluetooth, GPS"
                  />
                </div>
                {/* Location Latitude and Longitude */}
                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 items-end">
                  <div className="w-full sm:flex-1">
                    <label className="block text-sm font-medium mb-1">Location Latitude</label>
                    <input
                      name="locationLat"
                      type="number"
                      step="any"
                      value={form.locationLat}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="e.g., -1.9441"
                    />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-sm font-medium mb-1">Location Longitude</label>
                    <input
                      name="locationLng"
                      type="number"
                      step="any"
                      value={form.locationLng}
                      onChange={handleInputChange}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="e.g., 30.0619"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="w-full sm:w-auto h-10 px-4 mb-0 sm:mb-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Detect Location
                  </button>
                </div>
                {/* Location Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Location Address</label>
                  <input
                    name="locationAddress"
                    value={form.locationAddress}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., Kigali, Rwanda"
                  />
                </div>
              </div>
              {/* Description */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Description</label>
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={generatingDescription}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {generatingDescription ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {generatingDescription ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea

                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Brief description of the vehicle ..."
                  rows={2}
                />
              </div>
              {/* Images */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Vehicle Images * (1-5 images)</label>
                <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    onChange={handleImageChange}
                    id="vehicle-images"
                  />
                  <label htmlFor="vehicle-images" className="cursor-pointer flex flex-col items-center">
                    <span className="text-3xl text-gray-400 mb-2">📷</span>
                    <span className="text-gray-500 text-sm">Click to upload images or drag and drop</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB each (max 5 images)</span>
                  </label>
                  {form.images.length > 0 && (
                    <div className="mt-3 w-full">
                      <p className="text-sm font-medium text-gray-700 mb-2">{form.images.length} image(s) selected:</p>
                      <div className="space-y-1">
                        {form.images.map((file, idx) => (
                          <div key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Price per Day or Selling Price */}
              {form.listing_type === 'rent' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Price per Day ($) *</label>
                  <input
                    name="dailyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.dailyRate}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., 45"
                    required={form.listing_type === 'rent'}
                  />
                </div>
              )}
              {form.listing_type === 'sale' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Selling Price ($) *</label>
                  <input
                    name="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.selling_price}
                    onChange={handleInputChange}
                    className="w-full border px-3 py-2 rounded"
                    placeholder="e.g., 15000"
                    required={form.listing_type === 'sale'}
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => {
                    setShowModal(false);
                    setForm(initialForm);
                    setUploadError(null);
                    setEditingId(null); // Reset edit mode
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-blue-700 text-white font-semibold hover:bg-blue-800"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;

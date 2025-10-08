import React, { useEffect, useState } from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Car } from 'lucide-react';
import { apiClient } from "@/services/apiClient";

interface Vehicle {
  id: number;
  make: string;
  model: string;
  type: string;
  status: string;
  bookings: number;
  daily_rate: number; // keep as daily_rate
  license_plate: string;
}

const initialForm = {
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
  images: [] as File[],
  locationLat: '',
  locationLng: '',
  locationAddress: '',
  listing_type: 'rent',
  selling_price: '',
};

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/vehicles');
      const data = response.data as { vehicles: Vehicle[] };
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm(prev => ({ ...prev, images: files }));
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
    };

    try {
      // 3️⃣ Create vehicle
      interface VehiclePostResponse {
        data?: {
          vehicleId?: string | number;
          [key: string]: any;
        };
        vehicleId?: string | number;
        id?: string | number;
        [key: string]: any;
      }

      const res = await apiClient.post<VehiclePostResponse>('/vehicles', vehicleData);
      console.log("✅ Backend response:", res.data);

      // Safely extract vehicleId
      const vehicleId =
        res.data?.data?.vehicleId ||
        res.data?.vehicleId ||
        res.data?.id ||
        (res as any).vehicleId ||
        null;

      if (!vehicleId) {
        console.error("❌ No vehicleId found in response:", res.data);
        throw new Error('Vehicle ID not returned from backend.');
      }

      // 4️⃣ Upload images if any - USE postFormData instead of post!
      if (form.images.length > 0) {
        console.log(`📤 Uploading ${form.images.length} images for vehicle ${vehicleId}`);
        
        const imgForm = new FormData();
        form.images.forEach((file, idx) => {
          console.log(`Adding file ${idx + 1}: ${file.name}, size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
          imgForm.append('images', file); // Key MUST be 'images' (plural)
        });

        // 🔥 USE postFormData instead of post - this method doesn't set Content-Type!
        const uploadRes = await apiClient.postFormData(`/vehicles/upload/${vehicleId}`, imgForm);
        
        if (!uploadRes.success) {
          throw new Error(uploadRes.message || 'Failed to upload images');
        }

        console.log('✅ Images uploaded successfully:', uploadRes.data);
      }

      // ✅ Done
      setShowModal(false);
      setForm(initialForm);
      fetchVehicles();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to add vehicle. Please check your input.';
      setUploadError(errorMsg);
      console.error('Add vehicle error:', err);
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

  return (
    <SidebarLayout>
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Vehicle Management</h1>
            <p className="text-gray-600 mt-1">Manage your fleet of vehicles</p>
          </div>
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-semibold flex items-center"
            onClick={() => setShowModal(true)}
          >
            <Car className="w-5 h-5 mr-2" /> Add Vehicle
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search vehicles..."
            className="px-4 py-2 border border-gray-300 rounded-lg w-64"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Van</option>
            <option>Truck</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
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
                      <Car className="w-5 h-5 text-gray-400" />
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
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === 'available'
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
                    <td className="px-6 py-4 flex gap-3">
                      <button className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button className="text-red-600 hover:underline text-xs">Delete</button>
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
              className="bg-white rounded-xl shadow-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-8 relative"
              style={{ boxSizing: 'border-box' }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                onClick={() => {
                  setShowModal(false);
                  setForm(initialForm);
                  setUploadError(null);
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
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <div className="col-span-2">
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
                  <div className="col-span-2 flex gap-2 items-end">
                    <div className="flex-1">
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
                    <div className="flex-1">
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
                      className="h-10 px-4 mb-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Show Me Location
                    </button>
                  </div>
                  {/* Location Address */}
                  <div className="col-span-2">
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
                  <label className="block text-sm font-medium mb-1">Description</label>
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
    </SidebarLayout>
  );
};

export default VehiclesPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VehicleMap from '../components/VehicleMap';
import { apiClient } from '@/services/apiClient';
import { useSettings } from '@/contexts/SettingContxt';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

interface GetImageUrlParam {
  // If your image object has a specific structure, define it here
  [key: string]: any;
}

const getImageUrl = (img: string | GetImageUrlParam | null): string => {
  if (!img || typeof img !== 'string') return '/placeholder.png';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const normalizedImg = img.startsWith('/') ? img : `/${img}`;
  return `${STATIC_BASE_URL}${normalizedImg}`;
};

interface VehicleImage {
  // If you know the structure, add more fields
  [key: string]: any;
}

const parseVehicleImages = (images: string | VehicleImage[] | null | undefined): VehicleImage[] => {
  let parsedImages: VehicleImage[] = [];
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

interface Vehicle {
  id: string | number;
  make?: string;
  model?: string;
  type?: string;
  status?: string;
  location?: string;
  location_address?: string;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  images?: string | VehicleImage[] | null;
  rating?: number;
  reviews?: number;
  listing_type?: string;
  selling_price?: number;
  price?: number;
  // Add other fields as needed
}

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Debug: Log GPS values and backend response
  if (vehicle) {
    console.log('DEBUG vehicle object:', vehicle);
    console.log('DEBUG typeof locationLat:', typeof vehicle.locationLat, 'value:', vehicle.locationLat);
    console.log('DEBUG typeof locationLng:', typeof vehicle.locationLng, 'value:', vehicle.locationLng);
  }

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      const res: { success?: boolean; data?: any } = await apiClient.get(`/vehicles/${id}`);
      if (res && res.success && res.data) {
        let v = res.data?.vehicle ?? res.data;
        // Parse GPS coordinates as numbers if present
        v = {
          ...v,
          locationLat:
            v.locationLat !== undefined && v.locationLat !== null && !isNaN(Number(v.locationLat))
              ? Number(v.locationLat)
              : (v.location_lat !== undefined && v.location_lat !== null && !isNaN(Number(v.location_lat))
                ? Number(v.location_lat)
                : undefined),
          locationLng:
            v.locationLng !== undefined && v.locationLng !== null && !isNaN(Number(v.locationLng))
              ? Number(v.locationLng)
              : (v.location_lng !== undefined && v.location_lng !== null && !isNaN(Number(v.location_lng))
                ? Number(v.location_lng)
                : undefined),
        };
        setVehicle(v);
      } else {
        setVehicle(null);
      }
      setLoading(false);
    };
    if (id) fetchVehicle();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading vehicle details...</div>;
  }
  if (!vehicle) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Vehicle not found.</div>;
  }

  const images = parseVehicleImages(vehicle.images);
  const allImages = images && images.length > 0 ? images : [];

  const { formatPrice } = useSettings();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {allImages.length > 0 ? allImages.map((img, idx) => (
                <img
                  key={idx}
                  src={getImageUrl(img)}
                  alt={`Vehicle image ${idx + 1}`}
                  className="w-full max-w-xs h-64 object-cover rounded-xl shadow-lg border"
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                />
              )) : (
                <img
                  src={getImageUrl(null)}
                  alt="No vehicle images"
                  className="w-full max-w-xs h-64 object-cover rounded-xl shadow-lg border"
                />
              )}
            </div>
          </div>
          {/* Map for GPS location */}
          {Number.isFinite(vehicle.locationLat) && Number.isFinite(vehicle.locationLng) && (
            <VehicleMap
              lat={vehicle.locationLat as number}
              lng={vehicle.locationLng as number}
              address={vehicle.locationAddress || vehicle.location}
            />
          )}
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{vehicle.make} {vehicle.model}</h1>
          <p className="text-gray-600 mb-2">Type: {vehicle.type}</p>
          <p className={`mb-2 font-bold ${vehicle.status === 'Available' ? 'text-green-600' :
            (vehicle.status === 'Rented' || vehicle.status === 'Sold') ? 'text-red-600' : 'text-yellow-600'
            }`}>
            Status: {vehicle.status}
          </p>
          <div className="mb-2">
            <span className="font-semibold">Location:</span> {vehicle.location_address || 'N/A'}
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {Array(5)
                .fill(0)
                .map((_, idx) => (
                  <span key={idx} className={idx < Math.round(vehicle.rating ?? 0) ? '' : 'text-gray-300'}>★</span>
                ))}
            </div>
            <span className="text-sm text-gray-600">{vehicle.rating} ({vehicle.reviews} reviews)</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mb-4">
            {vehicle.listing_type === 'sale' ? formatPrice(vehicle.selling_price || 0) : `${formatPrice(vehicle.price || 0)} per day`}
          </div>
          <button
            className={`font-semibold px-6 py-3 rounded-lg shadow-lg transition ${vehicle.status === 'Rented' || vehicle.status === 'Sold'
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#2c4a9d] hover:bg-[#1e3a7d] text-white'
              }`}
            onClick={() => {
              if (vehicle.status !== 'Rented' && vehicle.status !== 'Sold') {
                navigate(`/Booking/${vehicle.id}`, { state: { vehicle } });
              }
            }}
            disabled={vehicle.status === 'Rented' || vehicle.status === 'Sold'}
          >
            {vehicle.status === 'Rented' ? 'RENTED' : vehicle.status === 'Sold' ? 'SOLD' : (vehicle.listing_type === 'sale' ? 'BUY IT' : 'Book Now')}
          </button>
          {/* GPS Navigation Button */}
          {Number.isFinite(vehicle.locationLat) && Number.isFinite(vehicle.locationLng) && (
            <button
              title={`Navigate to Latitude: ${vehicle.locationLat}, Longitude: ${vehicle.locationLng}`}
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${vehicle.locationLat},${vehicle.locationLng}`;
                window.open(url, '_blank');
              }}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              GPS: {vehicle.locationLat}, {vehicle.locationLng}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailPage;


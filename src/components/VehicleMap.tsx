import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface VehicleMapProps {
  lat: number;
  lng: number;
  address?: string;
}

const VehicleMap: React.FC<VehicleMapProps> = ({ lat, lng, address }) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') return <div>No GPS coordinates available.</div>;
  const center: LatLngExpression = [lat, lng];

  // Function to open Google Maps navigation
  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ height: '340px', width: '100%', margin: '1rem 0' }}>
      <div style={{ height: '300px', width: '100%' }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={center}>
            <Popup>
              {address ? address : `Lat: ${lat}, Lng: ${lng}`}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <button
        onClick={handleNavigate}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Navigate
      </button>
    </div>
  );
};

export default VehicleMap;

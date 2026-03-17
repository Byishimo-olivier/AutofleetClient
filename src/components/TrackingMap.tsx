import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet in many bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString()
});

export interface TrackingPoint {
  latitude: number;
  longitude: number;
  timestamp?: string;
  speed?: number | null;
}

interface TrackingMapProps {
  points: TrackingPoint[];
  height?: number;
  highlightLatest?: boolean;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ points, height = 280, highlightLatest = true }) => {
  const validPoints = useMemo(() => (
    points
      .filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
      .map(p => ({ ...p }))
  ), [points]);

  if (!validPoints.length) {
    return <div className="text-sm text-gray-500">No map data available.</div>;
  }

  const latest = validPoints[0];
  const center: LatLngExpression = [latest.latitude, latest.longitude];
  const polyline: LatLngExpression[] = validPoints.map(p => [p.latitude, p.longitude]);

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {polyline.length > 1 && (
          <Polyline positions={polyline} pathOptions={{ color: '#2563eb', weight: 4 }} />
        )}
        {validPoints.map((p, idx) => (
          <Marker key={`${p.latitude}-${p.longitude}-${idx}`} position={[p.latitude, p.longitude]}>
            <Popup>
              <div className="text-xs">
                <div>Lat: {p.latitude}</div>
                <div>Lng: {p.longitude}</div>
                {p.speed !== undefined && p.speed !== null && <div>Speed: {p.speed} km/h</div>}
                {p.timestamp && <div>Time: {new Date(p.timestamp).toLocaleString()}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
        {highlightLatest && latest && (
          <Marker position={[latest.latitude, latest.longitude]}>
            <Popup>Latest location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;

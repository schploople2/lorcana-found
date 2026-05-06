import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import type { LorcanaEvent } from '../types';
import { formatPrice, getFormatColor } from '../utils';
import 'leaflet/dist/leaflet.css';

interface Props {
  events: LorcanaEvent[];
  centerLat?: number;
  centerLon?: number;
}

export function MapView({ events, centerLat = 37.7749, centerLon = -122.4194 }: Props) {
  const navigate = useNavigate();

  const mappable = events.filter(e => e.latitude != null && e.longitude != null);

  return (
    <div className="map-wrap">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        key={`${centerLat},${centerLon}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mappable.map(e => {
          const color = getFormatColor(e.gameplay_format?.name);
          const d = new Date(e.start_datetime);
          return (
            <CircleMarker
              key={e.id}
              center={[e.latitude!, e.longitude!]}
              radius={8}
              fillColor={color}
              color="#fff"
              weight={1.5}
              fillOpacity={0.9}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-format" style={{ background: color }}>
                    {e.gameplay_format?.name ?? 'Other'}
                  </div>
                  <div className="map-popup-name">{e.name}</div>
                  <div className="map-popup-meta">
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' · '}
                    {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                  {e.store && <div className="map-popup-store">{e.store.name}</div>}
                  <div className="map-popup-fee">{formatPrice(e.cost_in_cents, e.currency)}</div>
                  <button
                    className="map-popup-btn"
                    onClick={() => navigate(`/events/${e.id}`)}
                  >
                    View Details →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

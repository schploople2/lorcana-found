import { useRef, useState } from 'react';
import { geocodeSearch, reverseGeocode } from '../services/api';
import type { EventFilters, GeoResult } from '../types';

interface Props {
  filters: EventFilters;
  onChange: (f: EventFilters) => void;
}

export function EventFiltersPanel({ filters, onChange }: Props) {
  const [locationInput, setLocationInput] = useState(filters.locationName ?? '');
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleLocationChange = (value: string) => {
    setLocationInput(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await geocodeSearch(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch { /* ignore */ }
      }, 350);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (result: GeoResult) => {
    const name = result.city
      ? `${result.city}${result.state ? `, ${result.state}` : ''}`
      : result.displayName.split(',').slice(0, 2).join(',').trim();
    setLocationInput(name);
    setShowSuggestions(false);
    onChange({ ...filters, latitude: result.lat, longitude: result.lon, locationName: name });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const name = geo.city
            ? `${geo.city}${geo.state ? `, ${geo.state}` : ''}`
            : 'Current location';
          setLocationInput(name);
          onChange({ ...filters, latitude: geo.lat, longitude: geo.lon, locationName: name });
        } catch { /* ignore */ } finally {
          setGeoLoading(false);
        }
      },
      () => setGeoLoading(false),
    );
  };

  return (
    <div className="filters-panel">
      <div className="filters-logo">
        <span className="filters-logo-icon">✦</span>
        <span className="filters-logo-text">Lorcana Found</span>
      </div>

      <div className="filter-group">
        <label className="filter-label">Location</label>
        <div className="location-wrap">
          <input
            type="text"
            className="filter-input"
            value={locationInput}
            onChange={e => handleLocationChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City, ZIP, or address…"
          />
          {showSuggestions && (
            <ul className="suggestions">
              {suggestions.map((s, i) => (
                <li key={i} onMouseDown={() => selectSuggestion(s)}>
                  {s.displayName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="geo-btn"
          onClick={handleUseMyLocation}
          disabled={geoLoading}
        >
          {geoLoading ? '…' : '◎'} Use my location
        </button>
      </div>

      <div className="filter-group">
        <label className="filter-label">Radius</label>
        <select
          className="filter-select"
          value={filters.radiusMiles}
          onChange={e => onChange({ ...filters, radiusMiles: Number(e.target.value) })}
        >
          <option value={5}>5 miles</option>
          <option value={10}>10 miles</option>
          <option value={25}>25 miles</option>
          <option value={50}>50 miles</option>
          <option value={100}>100 miles</option>
          <option value={250}>250 miles</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          type="text"
          className="filter-input"
          value={filters.search ?? ''}
          onChange={e => onChange({ ...filters, search: e.target.value || undefined })}
          placeholder="Event name or store…"
        />
      </div>

      <div className="filter-legend">
        <div className="legend-title">Format</div>
        {[
          ['Constructed', '#4F46E5'],
          ['Sealed', '#7C3AED'],
          ['Draft', '#16A34A'],
          ['Two-Headed Giant', '#EA580C'],
          ['Other', '#6366F1'],
        ].map(([name, color]) => (
          <div key={name} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

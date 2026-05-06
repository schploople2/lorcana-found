import type { EventFilters, EventsResponse, GeoResult, LorcanaEvent, RegistrationsResponse } from '../types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchEvents(
  filters: EventFilters,
  dateRange: { start: Date; end: Date },
  mode: 'upcoming' | 'past' = 'upcoming',
  page = 1,
): Promise<EventsResponse> {
  const p = new URLSearchParams();
  p.set('page', String(page));
  p.set('page_size', '100');

  if (filters.latitude != null)  p.set('latitude',  String(filters.latitude));
  if (filters.longitude != null) p.set('longitude', String(filters.longitude));
  if (filters.latitude != null)  p.set('num_miles', String(filters.radiusMiles));
  if (filters.search)            p.set('search', filters.search);

  p.set('start_date_after',  dateRange.start.toISOString());
  p.set('start_date_before', dateRange.end.toISOString());

  if (mode === 'past') {
    p.append('display_statuses', 'past');
    p.append('display_statuses', 'complete');
    p.set('ordering', '-start_datetime');
  } else {
    p.append('display_statuses', 'upcoming');
    p.append('display_statuses', 'inProgress');
  }

  return get<EventsResponse>(`/events?${p}`);
}

export async function fetchEvent(id: number): Promise<LorcanaEvent> {
  return get<LorcanaEvent>(`/events/${id}`);
}

export async function fetchRegistrations(eventId: number): Promise<RegistrationsResponse> {
  return get<RegistrationsResponse>(`/events/${eventId}/registrations`);
}

export async function geocodeSearch(q: string): Promise<GeoResult[]> {
  return get<GeoResult[]>(`/geocode/search?q=${encodeURIComponent(q)}`);
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoResult> {
  return get<GeoResult>(`/geocode/reverse?lat=${lat}&lon=${lon}`);
}

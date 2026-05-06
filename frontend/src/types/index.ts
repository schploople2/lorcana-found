export interface GameplayFormat {
  id: number;
  name: string;
  description: string;
}

export interface Store {
  id: number;
  name: string;
  full_address: string;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  administrative_area_level_1_short: string | null;
  state: string | null;
  country: string | null;
}

export interface LorcanaEvent {
  id: number;
  name: string;
  description: string;
  start_datetime: string;
  end_datetime: string | null;
  day_2_start_datetime: string | null;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  gameplay_format: GameplayFormat | null;
  event_type: string;
  event_status: 'UNLISTED' | 'SCHEDULED' | 'CANCELED' | 'ARCHIVED';
  display_status: 'upcoming' | 'inProgress' | 'past' | 'complete';
  registered_user_count: number;
  capacity: number | null;
  cost_in_cents: number;
  currency: string | null;
  event_is_online: boolean;
  store: Store | null;
  timezone: string;
  number_of_rounds: number | null;
  prizes_awarded: boolean;
  rules_enforcement_level: string;
  number_of_days: number;
}

export interface EventsResponse {
  count: number;
  total: number;
  page_size: number;
  current_page_number: number;
  next_page_number: number | null;
  previous_page_number: number | null;
  results: LorcanaEvent[];
}

export interface Registration {
  id: number;
  user: { id: number; best_identifier: string };
  best_identifier: string;
  special_user_identifier: string;
  registration_status: string;
  matches_won: number;
  matches_lost: number;
  matches_drawn: number;
  total_match_points: number;
  final_place_in_standings: number | null;
  full_profile_picture_url: string | null;
}

export interface RegistrationsResponse {
  count: number;
  total: number;
  results: Registration[];
}

export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
  city: string;
  state: string;
  country: string;
}

export interface EventFilters {
  latitude?: number;
  longitude?: number;
  locationName?: string;
  radiusMiles: number;
  search?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type ViewMode = 'calendar' | 'list' | 'map';
export type EventMode = 'upcoming' | 'past';

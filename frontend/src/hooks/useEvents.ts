import { useEffect, useRef, useState } from 'react';
import { fetchEvents } from '../services/api';
import type { DateRange, EventFilters, LorcanaEvent } from '../types';

interface UseEventsParams {
  filters: EventFilters;
  dateRange: DateRange;
}

interface UseEventsResult {
  events: LorcanaEvent[];
  loading: boolean;
  error: string | null;
}

export function useEvents({ filters, dateRange }: UseEventsParams): UseEventsResult {
  const [events, setEvents] = useState<LorcanaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchEvents(filters, dateRange)
      .then(data => {
        if (controller.signal.aborted) return;
        setEvents(data.results);
        setLoading(false);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setError(err.message ?? 'Failed to load events');
        setLoading(false);
      });

    return () => { controller.abort(); };
  }, [
    filters.latitude,
    filters.longitude,
    filters.radiusMiles,
    filters.search,
    dateRange.start.toISOString(),
    dateRange.end.toISOString(),
  ]);

  return { events, loading, error };
}

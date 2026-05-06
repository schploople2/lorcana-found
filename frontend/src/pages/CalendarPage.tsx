import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventFiltersPanel } from '../components/EventFilters';
import { ListView } from '../components/ListView';
import { MapView } from '../components/MapView';
import { useEvents } from '../hooks/useEvents';
import { reverseGeocode } from '../services/api';
import type { DateRange, EventFilters, EventMode, ViewMode } from '../types';
import { getFormatColor } from '../utils';

const DEFAULT_FILTERS: EventFilters = {
  latitude: 37.7749,
  longitude: -122.4194,
  locationName: 'San Francisco, CA',
  radiusMiles: 25,
};

const STORAGE_KEY = 'lorcana-found-filters';

function loadFilters(): EventFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_FILTERS;
}

function saveFilters(f: EventFilters) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(f)); } catch { /* ignore */ }
}

function monthStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function monthEnd(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 2, 0, 23, 59, 59);
}
function pastRangeStart() {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return d;
}

export function CalendarPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EventFilters>(loadFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [eventMode, setEventMode] = useState<EventMode>('upcoming');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return { start: monthStart(now), end: monthEnd(now) };
  });

  const effectiveDateRange = useMemo<DateRange>(() => {
    if (eventMode === 'past') {
      return { start: pastRangeStart(), end: new Date() };
    }
    return dateRange;
  }, [eventMode, dateRange]);

  const { events, loading, error } = useEvents({ filters, dateRange: effectiveDateRange, mode: eventMode });

  useEffect(() => { saveFilters(filters); }, [filters]);

  const didGeolocate = useRef(false);
  useEffect(() => {
    if (didGeolocate.current || !navigator.geolocation || filters.locationSet) return;
    didGeolocate.current = true;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        const name = geo.city
          ? `${geo.city}${geo.state ? `, ${geo.state}` : ''}`
          : 'Current location';
        setFilters(f => ({ ...f, latitude: geo.lat, longitude: geo.lon, locationName: name, locationSet: true }));
      } catch { /* keep default */ }
    });
  }, []);

  const calendarEvents = useMemo(() =>
    events.map(e => ({
      id: String(e.id),
      title: e.name,
      start: e.start_datetime,
      end: e.end_datetime ?? undefined,
      backgroundColor: getFormatColor(e.gameplay_format?.name),
      borderColor: getFormatColor(e.gameplay_format?.name),
      classNames: e.event_status === 'CANCELED' ? ['event-canceled'] : [],
      extendedProps: { event: e },
    })),
    [events],
  );

  const handleEventClick = useCallback((info: EventClickArg) => {
    info.jsEvent.preventDefault();
    navigate(`/events/${info.event.id}`);
  }, [navigate]);

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setDateRange({ start: arg.start, end: arg.end });
  }, []);

  const handleModeSwitch = (m: EventMode) => {
    setEventMode(m);
    if (m === 'past' && viewMode === 'calendar') setViewMode('list');
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <aside className="sidebar">
        <EventFiltersPanel filters={filters} onChange={setFilters} />
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button
            className="menu-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="topbar-title">
            <span className="topbar-logo">✦</span>
            Lorcana Found
          </div>

          <div className="mode-toggle">
            <button
              className={`mode-btn${eventMode === 'upcoming' ? ' mode-btn-active' : ''}`}
              onClick={() => handleModeSwitch('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`mode-btn${eventMode === 'past' ? ' mode-btn-active' : ''}`}
              onClick={() => handleModeSwitch('past')}
            >
              Past
            </button>
          </div>

          <div className="view-toggle">
            {eventMode === 'upcoming' && (
              <button
                className={`view-btn${viewMode === 'calendar' ? ' view-btn-active' : ''}`}
                onClick={() => setViewMode('calendar')}
                title="Calendar view"
              >📅</button>
            )}
            <button
              className={`view-btn${viewMode === 'list' ? ' view-btn-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >≡</button>
            <button
              className={`view-btn${viewMode === 'map' ? ' view-btn-active' : ''}`}
              onClick={() => setViewMode('map')}
              title="Map view"
            >◉</button>
          </div>

          {filters.locationName && (
            <div className="topbar-location">
              📍 {filters.locationName} · {filters.radiusMiles} mi
            </div>
          )}
          {loading && <div className="topbar-loading">Loading…</div>}
        </header>

        {error && <div className="error-banner">⚠ {error}</div>}

        {viewMode === 'map' ? (
          <MapView
            events={events}
            centerLat={filters.latitude}
            centerLon={filters.longitude}
          />
        ) : viewMode === 'list' ? (
          <div className="calendar-wrap">
            <ListView events={events} mode={eventMode} />
            {!loading && !error && events.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <p>{eventMode === 'past' ? 'No past events found in this area.' : 'No upcoming events found in this area.'}</p>
                <p className="empty-sub">Try expanding your radius or searching a different location.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-wrap">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
              events={calendarEvents}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="auto"
              eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
              eventDisplay="block"
              dayMaxEvents={4}
              nowIndicator
              eventContent={(arg) => (
                <div className="fc-event-inner" title={arg.event.title}>
                  <span className="fc-event-dot" />
                  <span className="fc-event-label">{arg.event.title}</span>
                </div>
              )}
            />
            {!loading && !error && events.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <p>No upcoming events found in this area.</p>
                <p className="empty-sub">Try expanding your radius or searching a different location.</p>
              </div>
            )}
          </div>
        )}

        {!loading && events.length > 0 && viewMode !== 'map' && (
          <div className="results-footer">
            {events.length} event{events.length === 1 ? '' : 's'} found
            {filters.locationName ? ` near ${filters.locationName}` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

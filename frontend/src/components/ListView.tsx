import { useNavigate } from 'react-router-dom';
import type { EventMode, LorcanaEvent } from '../types';
import { formatPrice, getFormatColor } from '../utils';

interface Props {
  events: LorcanaEvent[];
  mode: EventMode;
}

export function ListView({ events, mode }: Props) {
  const navigate = useNavigate();

  if (events.length === 0) return null;

  return (
    <div className="list-view">
      <table className="event-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Store</th>
            <th>Format</th>
            <th>Players</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          {events.map(e => {
            const d = new Date(e.start_datetime);
            const color = getFormatColor(e.gameplay_format?.name);
            const isCanceled = e.event_status === 'CANCELED';
            return (
              <tr
                key={e.id}
                className={`event-row${isCanceled ? ' event-row-canceled' : ''}`}
                onClick={() => navigate(`/events/${e.id}`)}
              >
                <td className="col-date">
                  <div className="col-date-day">{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                  <div className="col-date-time">{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                </td>
                <td className="col-name">
                  <span className="col-name-text">{e.name}</span>
                  {isCanceled && <span className="col-canceled-tag">Canceled</span>}
                  {mode === 'past' && e.prizes_awarded && <span className="col-results-tag">Results</span>}
                </td>
                <td className="col-store">{e.store?.name ?? '—'}</td>
                <td className="col-format">
                  <span className="format-pill" style={{ background: color }}>
                    {e.gameplay_format?.name ?? 'Other'}
                  </span>
                </td>
                <td className="col-players">
                  {e.registered_user_count}{e.capacity ? `/${e.capacity}` : ''}
                </td>
                <td className="col-fee">{formatPrice(e.cost_in_cents, e.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

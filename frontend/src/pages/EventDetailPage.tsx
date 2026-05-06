import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Registrations } from '../components/Registrations';
import { fetchEvent } from '../services/api';
import type { LorcanaEvent } from '../types';
import { formatEventDate, formatPrice, getFormatColor } from '../utils';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<LorcanaEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEvent(Number(id))
      .then(e => { setEvent(e); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  const handleShare = async () => {
    if (!event) return;
    const { date, time } = formatEventDate(event.start_datetime);
    const shareText = `${event.name}\n${date} at ${time}${event.store ? `\n${event.store.name}` : ''}\n\n${window.location.href}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, text: shareText, url: window.location.href });
        return;
      } catch { /* fall through to clipboard */ }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <p>Loading event…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-error">
        <p>Could not load event.</p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Go back</button>
      </div>
    );
  }

  const { date, time } = formatEventDate(event.start_datetime);
  const price = formatPrice(event.cost_in_cents, event.currency);
  const color = getFormatColor(event.gameplay_format?.name);
  const isCanceled = event.event_status === 'CANCELED';
  const isPast = new Date(event.start_datetime) < new Date();

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="detail-topbar">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Calendar
          </button>
          <button className="share-btn" onClick={handleShare}>
            {copied ? '✓ Copied!' : '⤴ Share'}
          </button>
        </div>

        <div className="detail-card">
          {isCanceled && <div className="canceled-banner">This event has been canceled</div>}

          <div className="detail-badge" style={{ background: color }}>
            {event.gameplay_format?.name ?? 'Lorcana Event'}
          </div>

          <h1 className="detail-title">{event.name}</h1>

          <div className="detail-meta-grid">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <div>
                <div className="meta-label">Date</div>
                <div className="meta-value">{date}</div>
                <div className="meta-subvalue">{time}</div>
              </div>
            </div>

            {event.full_address && (
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <div>
                  <div className="meta-label">Location</div>
                  <div className="meta-value">{event.full_address}</div>
                </div>
              </div>
            )}

            <div className="meta-item">
              <span className="meta-icon">💰</span>
              <div>
                <div className="meta-label">Entry Fee</div>
                <div className="meta-value">{price}</div>
              </div>
            </div>

            {event.capacity != null && (
              <div className="meta-item">
                <span className="meta-icon">👥</span>
                <div>
                  <div className="meta-label">Players</div>
                  <div className="meta-value">
                    {event.registered_user_count} / {event.capacity} registered
                  </div>
                </div>
              </div>
            )}

            {event.number_of_rounds != null && (
              <div className="meta-item">
                <span className="meta-icon">🎮</span>
                <div>
                  <div className="meta-label">Rounds</div>
                  <div className="meta-value">{event.number_of_rounds}</div>
                </div>
              </div>
            )}

            {event.number_of_days > 1 && (
              <div className="meta-item">
                <span className="meta-icon">📆</span>
                <div>
                  <div className="meta-label">Duration</div>
                  <div className="meta-value">{event.number_of_days} days</div>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className="detail-section">
              <h2>About This Event</h2>
              <p className="detail-description">{event.description}</p>
            </div>
          )}

          {event.store && (
            <div className="detail-section">
              <h2>Hosted By</h2>
              <div className="store-card">
                <div className="store-name">{event.store.name}</div>
                {event.store.full_address && (
                  <div className="store-address">{event.store.full_address}</div>
                )}
                {event.store.website && (
                  <a
                    href={event.store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-link"
                  >
                    Visit Store Website ↗
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h2>{isPast ? 'Results & Standings' : 'Registered Players'}</h2>
            <Registrations eventId={Number(id)} isPast={isPast} />
          </div>

          {!isCanceled && !isPast && (
            <a
              href={`https://tcg.ravensburgerplay.com/events/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="register-btn"
            >
              View &amp; Register on Official Site ↗
            </a>
          )}
          {isPast && (
            <a
              href={`https://tcg.ravensburgerplay.com/events/${event.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="register-btn register-btn-secondary"
            >
              View on Official Site ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

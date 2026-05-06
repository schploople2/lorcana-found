import { useEffect, useState } from 'react';
import { fetchRegistrations } from '../services/api';
import type { Registration } from '../types';

interface Props {
  eventId: number;
  isPast: boolean;
}

export function Registrations({ eventId, isPast }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchRegistrations(eventId)
      .then(data => {
        const sorted = (data.results ?? []).slice().sort((a, b) => {
          if (a.final_place_in_standings == null && b.final_place_in_standings == null) return 0;
          if (a.final_place_in_standings == null) return 1;
          if (b.final_place_in_standings == null) return -1;
          return a.final_place_in_standings - b.final_place_in_standings;
        });
        setRegistrations(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load player list');
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div className="reg-loading">Loading players…</div>;
  if (error)   return <div className="reg-error">{error}</div>;
  if (registrations.length === 0) return <div className="reg-empty">No registrations yet.</div>;

  const hasStandings = isPast && registrations.some(r => r.final_place_in_standings != null);

  return (
    <div className="reg-list">
      {isPast && hasStandings && (
        <div className="reg-header">
          <span className="reg-col-place">Place</span>
          <span className="reg-col-name">Player</span>
          <span className="reg-col-record">Record</span>
        </div>
      )}
      {registrations.map((r, i) => (
        <div key={r.id} className={`reg-row${r.final_place_in_standings === 1 ? ' reg-row-first' : ''}`}>
          {isPast && hasStandings ? (
            <>
              <span className="reg-col-place">
                {r.final_place_in_standings != null ? `#${r.final_place_in_standings}` : '—'}
              </span>
              <span className="reg-col-name">{r.best_identifier}</span>
              <span className="reg-col-record reg-record">
                {r.matches_won}–{r.matches_lost}{r.matches_drawn > 0 ? `–${r.matches_drawn}` : ''}
              </span>
            </>
          ) : (
            <>
              <span className="reg-col-num">{i + 1}.</span>
              <span className="reg-col-name">{r.best_identifier}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export const FORMAT_COLORS: Record<string, string> = {
  'Core Constructed':     '#4F46E5',  // indigo
  'Infinity Constructed': '#7C3AED',  // violet
  'Sealed':               '#0891B2',  // cyan
  'Pack Rush':            '#EA580C',  // orange
  'Draft':                '#16A34A',  // green
};

export function getFormatColor(formatName?: string | null): string {
  if (!formatName) return '#6366F1';
  return FORMAT_COLORS[formatName] ?? '#6366F1';
}

export function formatPrice(costInCents: number, currency?: string | null): string {
  if (!costInCents || costInCents === 0) return 'Free';
  const dollars = (costInCents / 100).toFixed(2);
  const upper = (currency ?? 'usd').toUpperCase();
  return upper === 'USD' ? `$${dollars}` : `${dollars} ${upper}`;
}

export function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

/**
 * Time utility functions for the Corporate Developer Task Logger.
 */

/**
 * Calculate decimal hours between two HH:mm time strings.
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Decimal hours (e.g., 1.5 for 1h30m)
 */
export function calculateHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  const diff = endMinutes - startMinutes;
  return Math.round((diff / 60) * 100) / 100;
}

/**
 * Returns today's date in YYYY-MM-DD format.
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Returns the current ISO timestamp string.
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get the Monday–Sunday week range for a given date.
 * @param date - Date string in YYYY-MM-DD format
 * @returns Object with start (Monday) and end (Sunday) in YYYY-MM-DD
 */
export function getWeekRange(date: string): { start: string; end: string } {
  const d = new Date(date + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/**
 * Get the first and last day of a given month.
 * @param year - Full year (e.g., 2026)
 * @param month - Month number (1–12)
 * @returns Object with start and end dates in YYYY-MM-DD
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0); // last day of the month

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

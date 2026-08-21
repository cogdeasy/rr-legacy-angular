const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const pad = (value: number): string => value.toString().padStart(2, '0');

/**
 * Replaces the Angular `date` pipe for the patterns the templates use: `dd`, `MMM`,
 * `MMMM`, `yyyy`, `HH` and `mm` are substituted from the local-time parts of the value.
 */
export function formatDate(value: string | Date, pattern: string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const replacements: Record<string, string> = {
    dd: pad(date.getDate()),
    MMMM: MONTHS_LONG[date.getMonth()],
    MMM: MONTHS_SHORT[date.getMonth()],
    yyyy: date.getFullYear().toString(),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes())
  };

  return pattern.replace(/MMMM|MMM|yyyy|dd|HH|mm/g, token => replacements[token]);
}

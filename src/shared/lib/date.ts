const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const shortMonthNames = monthNames.map((month) => month.slice(0, 3));

export function formatDate(value: string | Date, pattern: string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.getMonth();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  switch (pattern) {
    case 'dd MMM, HH:mm':
      return `${day} ${shortMonthNames[month]}, ${hours}:${minutes}`;
    case 'MMMM yyyy':
      return `${monthNames[month]} ${year}`;
    case 'dd MMM yyyy, HH:mm':
      return `${day} ${shortMonthNames[month]} ${year}, ${hours}:${minutes}`;
    case 'dd MMM yyyy HH:mm':
      return `${day} ${shortMonthNames[month]} ${year} ${hours}:${minutes}`;
    case 'dd MMM yyyy':
      return `${day} ${shortMonthNames[month]} ${year}`;
    case 'dd MMM HH:mm':
      return `${day} ${shortMonthNames[month]} ${hours}:${minutes}`;
    default:
      return date.toString();
  }
}

export function currencyFormat(value: number | null | undefined, currencySymbol = '$', decimals = 0): string {
  if (value === null || value === undefined) {
    return '-';
  }
  const formatted = value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${currencySymbol}${formatted}`;
}

export function engineHours(value: number | null | undefined, unit = 'hrs'): string {
  if (value === null || value === undefined) {
    return '-';
  }
  const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${formatted} ${unit}`;
}

export function stateClass(state: string): string {
  switch (state) {
    case 'Act now':
      return 'state-act-now';
    case 'Watchlist':
      return 'state-watchlist';
    case 'Nominal':
      return 'state-nominal';
    default:
      return 'state-no-data';
  }
}

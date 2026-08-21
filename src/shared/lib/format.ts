import { EngineState } from '../models/engine';

const withThousands = (value: string): string => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Replaces the Angular `currencyFormat` pipe. */
export function currencyFormat(value: number | null | undefined, currencySymbol = '$', decimals = 0): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return `${currencySymbol}${withThousands(value.toFixed(decimals))}`;
}

/** Replaces the Angular `engineHours` pipe. */
export function engineHours(value: number | null | undefined, unit = 'hrs'): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return `${withThousands(Math.round(value).toString())} ${unit}`;
}

/** Replaces the Angular `stateClass` pipe. */
export function stateClass(state: EngineState): string {
  switch (state) {
    case EngineState.ActNow:
      return 'state-act-now';
    case EngineState.Watchlist:
      return 'state-watchlist';
    case EngineState.Nominal:
      return 'state-nominal';
    default:
      return 'state-no-data';
  }
}

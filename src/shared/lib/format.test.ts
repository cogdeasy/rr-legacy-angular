import { describe, expect, it } from 'vitest';
import { currencyFormat, engineHours, stateClass } from './format';
import { EngineState } from '../models/engine';

describe('stateClass', () => {
  it('maps act now to the act now class', () => {
    expect(stateClass(EngineState.ActNow)).toBe('state-act-now');
  });

  it('maps watchlist to the watchlist class', () => {
    expect(stateClass(EngineState.Watchlist)).toBe('state-watchlist');
  });

  it('maps nominal to the nominal class', () => {
    expect(stateClass(EngineState.Nominal)).toBe('state-nominal');
  });

  it('falls back to the no data class', () => {
    expect(stateClass(EngineState.NoData)).toBe('state-no-data');
  });
});

describe('currencyFormat', () => {
  it('renders a dash for missing values', () => {
    expect(currencyFormat(null)).toBe('-');
    expect(currencyFormat(undefined)).toBe('-');
  });

  it('groups thousands and prefixes the symbol', () => {
    expect(currencyFormat(1234567)).toBe('$1,234,567');
  });

  it('supports decimals and an alternative symbol', () => {
    expect(currencyFormat(1234.5, '£', 2)).toBe('£1,234.50');
  });
});

describe('engineHours', () => {
  it('renders a dash for missing values', () => {
    expect(engineHours(null)).toBe('-');
  });

  it('rounds and groups the value with its unit', () => {
    expect(engineHours(24518.6)).toBe('24,519 hrs');
    expect(engineHours(8104, 'cycles')).toBe('8,104 cycles');
  });
});

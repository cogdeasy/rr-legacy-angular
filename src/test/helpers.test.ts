import { currencyFormat, engineHours, stateClass } from '../shared/lib/format';
import { formatDate } from '../shared/lib/date';
import { EngineState } from '../shared/models/engine';

describe('formatting helpers', () => {
  it('formats the supported date patterns', () => {
    const date = new Date(2026, 2, 26, 6, 15);

    expect(formatDate(date, 'dd MMM, HH:mm')).toBe('26 Mar, 06:15');
    expect(formatDate(date, 'MMMM yyyy')).toBe('March 2026');
    expect(formatDate(date, 'dd MMM yyyy, HH:mm')).toBe(
      '26 Mar 2026, 06:15'
    );
    expect(formatDate(date, 'dd MMM yyyy HH:mm')).toBe('26 Mar 2026 06:15');
    expect(formatDate(date, 'dd MMM yyyy')).toBe('26 Mar 2026');
    expect(formatDate(date, 'dd MMM HH:mm')).toBe('26 Mar 06:15');
  });

  it('treats date-only input as a local date in negative-offset zones', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');

    expect(formatDate('2016-09-05', 'dd MMM yyyy')).toBe('05 Sep 2016');

    vi.unstubAllEnvs();
  });

  it('preserves the timezone offset for Z datetimes', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');

    expect(formatDate('2016-09-05T00:00:00Z', 'dd MMM yyyy HH:mm')).toBe(
      '04 Sep 2016 17:00'
    );

    vi.unstubAllEnvs();
  });

  it('formats numeric values and empty values', () => {
    expect(currencyFormat(1452260)).toBe('$1,452,260');
    expect(currencyFormat(null)).toBe('-');
    expect(engineHours(570)).toBe('570 hrs');
    expect(engineHours(undefined)).toBe('-');
  });

  it.each([
    [EngineState.ActNow, 'state-act-now'],
    [EngineState.Watchlist, 'state-watchlist'],
    [EngineState.Nominal, 'state-nominal'],
    [EngineState.NoData, 'state-no-data']
  ])('maps %s to its state class', (state, className) => {
    expect(stateClass(state)).toBe(className);
  });
});

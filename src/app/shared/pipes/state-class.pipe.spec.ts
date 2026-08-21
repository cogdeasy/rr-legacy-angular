import { EngineState } from '../models/engine.model';
import { StateClassPipe } from './state-class.pipe';

describe('StateClassPipe', () => {
  const pipe = new StateClassPipe();

  it('maps act now to the act now class', () => {
    expect(pipe.transform(EngineState.ActNow)).toBe('state-act-now');
  });

  it('maps watchlist to the watchlist class', () => {
    expect(pipe.transform(EngineState.Watchlist)).toBe('state-watchlist');
  });

  it('maps nominal to the nominal class', () => {
    expect(pipe.transform(EngineState.Nominal)).toBe('state-nominal');
  });

  it('falls back to the no data class', () => {
    expect(pipe.transform(EngineState.NoData)).toBe('state-no-data');
  });
});

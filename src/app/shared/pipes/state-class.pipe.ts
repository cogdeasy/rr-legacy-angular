import { Pipe, PipeTransform } from '@angular/core';
import { EngineState } from '../models/engine.model';

@Pipe({
  name: 'stateClass'
})
export class StateClassPipe implements PipeTransform {
  transform(state: EngineState): string {
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
}

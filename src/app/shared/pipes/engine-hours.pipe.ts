import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'engineHours'
})
export class EngineHoursPipe implements PipeTransform {
  transform(value: number, unit = 'hrs'): string {
    if (value === null || value === undefined) {
      return '-';
    }
    const formatted = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${formatted} ${unit}`;
  }
}

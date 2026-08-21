import { Component, OnInit } from '@angular/core';
import { Engine, EngineTrend, TrendPoint } from '../../shared/models/engine.model';
import { FleetService } from '../../shared/services/fleet.service';

interface SignalOption {
  key: 'egtMargin' | 'vibrationIps' | 'oilConsumptionLph';
  label: string;
  unit: string;
  betterWhen: 'higher' | 'lower';
}

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const CHART_PADDING = 32;

@Component({
  selector: 'app-health-trending',
  templateUrl: './health-trending.component.html',
  styleUrls: ['./health-trending.component.scss']
})
export class HealthTrendingComponent implements OnInit {
  engines: Engine[] = [];
  trend: EngineTrend | null = null;
  selectedEsn = '';
  selectedSignal: SignalOption;
  isLoading = true;
  isTrendLoading = false;

  readonly chartWidth = CHART_WIDTH;
  readonly chartHeight = CHART_HEIGHT;

  readonly signals: SignalOption[] = [
    { key: 'egtMargin', label: 'EGT margin', unit: 'degC', betterWhen: 'higher' },
    { key: 'vibrationIps', label: 'Broadband vibration', unit: 'ips', betterWhen: 'lower' },
    { key: 'oilConsumptionLph', label: 'Oil consumption', unit: 'l/hr', betterWhen: 'lower' }
  ];

  constructor(private fleetService: FleetService) {
    this.selectedSignal = this.signals[0];
  }

  ngOnInit(): void {
    this.fleetService.getEngines().subscribe(engines => {
      this.engines = engines;
      this.isLoading = false;
      if (engines.length > 0) {
        this.selectEngine(engines[0].esn);
      }
    });
  }

  selectEngine(esn: string): void {
    this.selectedEsn = esn;
    this.isTrendLoading = true;
    this.fleetService.getTrend(esn).subscribe(trend => {
      this.trend = trend;
      this.isTrendLoading = false;
    });
  }

  selectSignal(signal: SignalOption): void {
    this.selectedSignal = signal;
  }

  get selectedEngine(): Engine | undefined {
    return this.engines.find(engine => engine.esn === this.selectedEsn);
  }

  get points(): TrendPoint[] {
    return this.trend ? this.trend.points : [];
  }

  get chartPoints(): ChartPoint[] {
    const values = this.points.map(point => point[this.selectedSignal.key]);
    if (values.length === 0) {
      return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
    const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

    return this.points.map((point, index) => {
      const value = point[this.selectedSignal.key];
      return {
        x: CHART_PADDING + (index / (this.points.length - 1)) * usableWidth,
        y: CHART_PADDING + usableHeight - ((value - min) / span) * usableHeight,
        label: point.date,
        value
      };
    });
  }

  get polyline(): string {
    return this.chartPoints.map(point => `${point.x},${point.y}`).join(' ');
  }

  get areaPath(): string {
    const points = this.chartPoints;
    if (points.length === 0) {
      return '';
    }
    const baseline = CHART_HEIGHT - CHART_PADDING;
    const line = points.map(point => `L ${point.x} ${point.y}`).join(' ');
    return `M ${points[0].x} ${baseline} ${line} L ${points[points.length - 1].x} ${baseline} Z`;
  }

  get currentValue(): number {
    const points = this.points;
    return points.length > 0 ? points[points.length - 1][this.selectedSignal.key] : 0;
  }

  get twelveMonthDelta(): number {
    const points = this.points;
    if (points.length < 2) {
      return 0;
    }
    const delta =
      points[points.length - 1][this.selectedSignal.key] - points[0][this.selectedSignal.key];
    return Math.round(delta * 100) / 100;
  }

  get deltaIsAdverse(): boolean {
    if (this.twelveMonthDelta === 0) {
      return false;
    }
    return this.selectedSignal.betterWhen === 'higher'
      ? this.twelveMonthDelta < 0
      : this.twelveMonthDelta > 0;
  }

  get peakValue(): number {
    const values = this.points.map(point => point[this.selectedSignal.key]);
    return values.length > 0 ? Math.max(...values) : 0;
  }

  get troughValue(): number {
    const values = this.points.map(point => point[this.selectedSignal.key]);
    return values.length > 0 ? Math.min(...values) : 0;
  }

  monthOnMonth(index: number): number {
    if (index === 0) {
      return 0;
    }
    const current = this.points[index][this.selectedSignal.key];
    const previous = this.points[index - 1][this.selectedSignal.key];
    return Math.round((current - previous) * 100) / 100;
  }
}

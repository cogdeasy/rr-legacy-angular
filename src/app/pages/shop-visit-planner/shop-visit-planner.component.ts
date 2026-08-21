import { Component, OnInit } from '@angular/core';
import {
  Engine,
  ShopVisitCostLine,
  ShopVisitEstimate,
  WorkscopeOption
} from '../../shared/models/engine.model';
import { FleetService } from '../../shared/services/fleet.service';

interface Facility {
  name: string;
  factor: number;
  note: string;
}

interface DonutSegment {
  label: string;
  dashArray: string;
  dashOffset: number;
  colour: string;
  share: number;
}

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 60;
const SEGMENT_COLOURS = [
  'var(--rr-series-1)',
  'var(--rr-series-2)',
  'var(--rr-series-3)',
  'var(--rr-series-4)',
  'var(--rr-series-5)'
];

@Component({
  selector: 'app-shop-visit-planner',
  templateUrl: './shop-visit-planner.component.html',
  styleUrls: ['./shop-visit-planner.component.scss']
})
export class ShopVisitPlannerComponent implements OnInit {
  engines: Engine[] = [];
  workscopeOptions: WorkscopeOption[] = [];
  selectedCodes: string[] = ['WS-HPT', 'WS-TEST'];
  selectedEsn = '';
  isLoading = true;

  readonly facilities: Facility[] = [
    { name: 'Derby', factor: 1, note: 'Home base, full module capability.' },
    { name: 'Dahlewitz', factor: 1.08, note: 'Specialist HP turbine cell, higher labour rate.' },
    { name: 'Singapore', factor: 0.94, note: 'Lower labour rate, longer parts lead time.' },
    { name: 'Dallas partner shop', factor: 1.16, note: 'Overflow capacity only.' }
  ];

  selectedFacility: Facility;

  constructor(private fleetService: FleetService) {
    this.selectedFacility = this.facilities[0];
  }

  ngOnInit(): void {
    this.workscopeOptions = this.fleetService.getWorkscopeOptions();
    this.fleetService.getEngines().subscribe(engines => {
      this.engines = engines;
      this.selectedEsn = engines.length > 0 ? engines[0].esn : '';
      this.isLoading = false;
    });
  }

  get selectedEngine(): Engine | undefined {
    return this.engines.find(engine => engine.esn === this.selectedEsn);
  }

  get estimate(): ShopVisitEstimate {
    return this.fleetService.estimateShopVisit(this.selectedCodes, this.selectedFacility.factor);
  }

  get projectedMargin(): number {
    const engine = this.selectedEngine;
    if (!engine) {
      return this.estimate.restoredEgtMargin;
    }
    return engine.egtMargin + this.estimate.restoredEgtMargin;
  }

  get donutSegments(): DonutSegment[] {
    let consumed = 0;
    return this.estimate.breakdown.map((line: ShopVisitCostLine, index: number) => {
      const length = (line.share / 100) * DONUT_CIRCUMFERENCE;
      const segment: DonutSegment = {
        label: line.label,
        dashArray: `${length} ${DONUT_CIRCUMFERENCE - length}`,
        dashOffset: -consumed,
        colour: SEGMENT_COLOURS[index % SEGMENT_COLOURS.length],
        share: line.share
      };
      consumed += length;
      return segment;
    });
  }

  isSelected(code: string): boolean {
    return this.selectedCodes.indexOf(code) > -1;
  }

  toggleWorkscope(code: string): void {
    if (this.isSelected(code)) {
      this.selectedCodes = this.selectedCodes.filter(selected => selected !== code);
    } else {
      this.selectedCodes = [...this.selectedCodes, code];
    }
  }

  selectFacility(facility: Facility): void {
    this.selectedFacility = facility;
  }

  resetWorkscope(): void {
    this.selectedCodes = [];
  }
}

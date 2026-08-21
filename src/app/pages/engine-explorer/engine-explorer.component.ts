import { Component, OnInit } from '@angular/core';
import { Engine, EngineFamily, EngineLocation, EngineState } from '../../shared/models/engine.model';
import { FleetService } from '../../shared/services/fleet.service';

@Component({
  selector: 'app-engine-explorer',
  templateUrl: './engine-explorer.component.html',
  styleUrls: ['./engine-explorer.component.scss']
})
export class EngineExplorerComponent implements OnInit {
  engines: Engine[] = [];
  isLoading = true;

  searchTerm = '';
  selectedState: EngineState | 'All' = 'All';
  selectedFamily: EngineFamily | 'All' = 'All';
  expandedEsn: string | null = null;

  readonly states: (EngineState | 'All')[] = [
    'All',
    EngineState.ActNow,
    EngineState.Watchlist,
    EngineState.Nominal,
    EngineState.NoData
  ];

  readonly families: (EngineFamily | 'All')[] = [
    'All',
    EngineFamily.Trent1000,
    EngineFamily.TrentXWB,
    EngineFamily.Trent7000,
    EngineFamily.Trent900,
    EngineFamily.BR725
  ];

  constructor(private fleetService: FleetService) {}

  ngOnInit(): void {
    this.fleetService.getEngines().subscribe(engines => {
      this.engines = engines;
      this.isLoading = false;
    });
  }

  get filteredEngines(): Engine[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.engines.filter(engine => {
      const matchesState = this.selectedState === 'All' || engine.state === this.selectedState;
      const matchesFamily = this.selectedFamily === 'All' || engine.family === this.selectedFamily;
      const matchesTerm =
        term.length === 0 ||
        engine.esn.toLowerCase().indexOf(term) > -1 ||
        engine.operator.toLowerCase().indexOf(term) > -1 ||
        engine.tailNumber.toLowerCase().indexOf(term) > -1 ||
        engine.hub.toLowerCase().indexOf(term) > -1;

      return matchesState && matchesFamily && matchesTerm;
    });
  }

  toggleEngine(esn: string): void {
    this.expandedEsn = this.expandedEsn === esn ? null : esn;
  }

  moduleUsagePct(cyclesSinceOverhaul: number, limitCycles: number): number {
    return Math.min(100, Math.round((cyclesSinceOverhaul / limitCycles) * 100));
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedState = 'All';
    this.selectedFamily = 'All';
  }

  locationIcon(location: EngineLocation): string {
    switch (location) {
      case EngineLocation.OnWing:
        return 'flight';
      case EngineLocation.ShopVisit:
        return 'build_circle';
      case EngineLocation.Spare:
        return 'inventory_2';
      default:
        return 'report_problem';
    }
  }
}

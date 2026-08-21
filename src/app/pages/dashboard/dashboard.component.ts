import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Engine, EngineState, FleetAlert, FleetStats } from '../../shared/models/engine.model';
import { User } from '../../shared/models/user.model';
import { AuthService } from '../../shared/services/auth.service';
import { FleetService } from '../../shared/services/fleet.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  stats: FleetStats | null = null;
  engines: Engine[] = [];
  alerts: FleetAlert[] = [];
  isLoading = true;

  readonly engineState = EngineState;

  constructor(
    private authService: AuthService,
    private fleetService: FleetService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;

    forkJoin({
      stats: this.fleetService.getFleetStats(),
      engines: this.fleetService.getEngines(),
      alerts: this.fleetService.getAlerts()
    }).subscribe(result => {
      this.stats = result.stats;
      this.engines = result.engines;
      this.alerts = result.alerts;
      this.isLoading = false;
    });
  }

  get attentionEngines(): Engine[] {
    return this.engines
      .filter(engine => engine.state === EngineState.ActNow || engine.state === EngineState.Watchlist)
      .sort((a, b) => a.egtMargin - b.egtMargin);
  }

  marginBarWidth(engine: Engine): number {
    return Math.min(100, Math.round((engine.egtMargin / 60) * 100));
  }
}

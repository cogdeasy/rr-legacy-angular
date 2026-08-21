import {
  Engine,
  EngineLocation,
  EngineState,
  EngineTrend,
  FleetAlert,
  FleetStats,
  ShopVisitCostLine,
  ShopVisitEstimate,
  TrendPoint,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderRequest,
  WorkOrderStatus,
  WorkscopeOption
} from '../models/engine';
import { createStore, delay, useStore } from '../lib/store';
import { alerts, engines, initialWorkOrders, workscopeOptions } from './fleetData';

const LABOUR_RATE_PER_HOUR = 118;

const workOrdersStore = createStore<WorkOrder[]>(initialWorkOrders);

export function useWorkOrdersStore(): WorkOrder[] {
  return useStore(workOrdersStore);
}

export function getEngines(): Promise<Engine[]> {
  return delay(engines, 600);
}

export function getEngine(esn: string): Promise<Engine | undefined> {
  return delay(
    engines.find(engine => engine.esn === esn),
    300
  );
}

export function getAlerts(): Promise<FleetAlert[]> {
  return delay(alerts, 500);
}

export function getFleetStats(): Promise<FleetStats> {
  const onWing = engines.filter(e => e.location === EngineLocation.OnWing).length;
  const inShopVisit = engines.filter(e => e.location === EngineLocation.ShopVisit).length;
  const actNow = engines.filter(e => e.state === EngineState.ActNow).length;
  const watchlist = engines.filter(e => e.state === EngineState.Watchlist).length;
  const reporting = engines.filter(e => e.state !== EngineState.NoData);
  const meanEgtMargin = reporting.reduce((sum, e) => sum + e.egtMargin, 0) / reporting.length;

  return delay(
    {
      enginesManaged: engines.length,
      onWing,
      inShopVisit,
      actNow,
      watchlist,
      availabilityPct: Math.round((onWing / engines.length) * 1000) / 10,
      meanEgtMargin: Math.round(meanEgtMargin * 10) / 10,
      aogOpen: workOrdersStore
        .get()
        .filter(wo => wo.priority === WorkOrderPriority.Aog && wo.status !== WorkOrderStatus.Closed).length
    },
    500
  );
}

function monthLabel(offset: number): string {
  const labels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  return labels[offset];
}

export function getTrend(esn: string): Promise<EngineTrend> {
  const engine = engines.find(e => e.esn === esn);
  const points: TrendPoint[] = [];
  const startMargin = engine ? engine.egtMargin + 14 : 40;
  const startVibration = engine ? engine.vibrationIps - 0.12 : 0.2;
  const startOil = engine ? engine.oilConsumptionLph - 0.08 : 0.15;

  for (let month = 0; month < 12; month++) {
    const drift = month / 11;
    const wobble = Math.sin(month * 1.1) * 1.4;
    points.push({
      date: monthLabel(month),
      egtMargin: Math.round((startMargin - drift * 14 + wobble) * 10) / 10,
      vibrationIps: Math.round((startVibration + drift * 0.12 + wobble * 0.008) * 100) / 100,
      oilConsumptionLph: Math.round((startOil + drift * 0.08 + wobble * 0.004) * 100) / 100
    });
  }

  return delay({ esn, points }, 450);
}

export function getWorkscopeOptions(): WorkscopeOption[] {
  return workscopeOptions;
}

function restoredMargin(codes: string[]): number {
  let margin = 0;
  if (codes.indexOf('WS-HPT') > -1) {
    margin += 34;
  }
  if (codes.indexOf('WS-IPC') > -1) {
    margin += 12;
  }
  if (codes.indexOf('WS-FAN') > -1) {
    margin += 5;
  }
  if (codes.indexOf('WS-LLP') > -1) {
    margin += 3;
  }
  return margin;
}

function restoredCycles(codes: string[]): number {
  let cycles = 0;
  if (codes.indexOf('WS-LLP') > -1) {
    cycles += 5000;
  }
  if (codes.indexOf('WS-HPT') > -1) {
    cycles += 3200;
  }
  if (codes.indexOf('WS-IPC') > -1) {
    cycles += 1800;
  }
  if (codes.indexOf('WS-FAN') > -1) {
    cycles += 900;
  }
  return cycles;
}

export function estimateShopVisit(codes: string[], facilityFactor: number): ShopVisitEstimate {
  const selected = workscopeOptions.filter(option => codes.indexOf(option.code) > -1);
  const labourHours = selected.reduce((sum, option) => sum + option.labourHours, 0);
  const labourCost = Math.round(labourHours * LABOUR_RATE_PER_HOUR * facilityFactor);
  const materialCost = Math.round(
    selected.reduce((sum, option) => sum + option.materialCost, 0) * facilityFactor
  );
  const totalCost = labourCost + materialCost;
  const turnaroundDays = selected.reduce(
    (days, option) => Math.max(days, option.turnaroundDays) + Math.round(option.turnaroundDays * 0.35),
    0
  );

  const breakdown: ShopVisitCostLine[] = selected.map(option => {
    const cost = Math.round(
      (option.labourHours * LABOUR_RATE_PER_HOUR + option.materialCost) * facilityFactor
    );
    return {
      label: option.label,
      cost,
      share: totalCost > 0 ? Math.round((cost / totalCost) * 1000) / 10 : 0
    };
  });

  return {
    labourHours,
    labourCost,
    materialCost,
    totalCost,
    turnaroundDays,
    restoredEgtMargin: restoredMargin(codes),
    cyclesRestored: restoredCycles(codes),
    breakdown
  };
}

export async function submitWorkOrder(request: WorkOrderRequest): Promise<WorkOrder> {
  const engine = engines.find(e => e.esn === request.esn);
  const created: WorkOrder = {
    id: `WO-${30440 + workOrdersStore.get().length}`,
    esn: request.esn,
    operator: engine ? engine.operator : 'Unassigned',
    title: request.title,
    priority: request.priority,
    status: WorkOrderStatus.Raised,
    facility: request.facility,
    raisedBy: request.requesterName,
    raisedOn: new Date().toISOString(),
    dueOn: request.dueOn,
    labourHours: 0,
    tasks: request.requestedTasks
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => ({
        reference: `TC-${9000 + index}`,
        description: line,
        complete: false
      }))
  };

  const workOrder = await delay(created, 900);
  workOrdersStore.set([workOrder, ...workOrdersStore.get()]);
  return workOrder;
}

export function getWorkOrders(): Promise<WorkOrder[]> {
  return delay(workOrdersStore.get(), 500);
}

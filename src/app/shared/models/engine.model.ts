export enum EngineFamily {
  Trent1000 = 'Trent 1000',
  TrentXWB = 'Trent XWB-84',
  Trent7000 = 'Trent 7000',
  Trent900 = 'Trent 900',
  BR725 = 'BR725'
}

export enum EngineState {
  ActNow = 'Act now',
  Watchlist = 'Watchlist',
  Nominal = 'Nominal',
  NoData = 'No data'
}

export enum EngineLocation {
  OnWing = 'On wing',
  ShopVisit = 'Shop visit',
  Spare = 'Spare pool',
  Quarantine = 'Quarantine'
}

export enum WorkOrderStatus {
  Draft = 'Draft',
  Raised = 'Raised',
  InWork = 'In work',
  AwaitingParts = 'Awaiting parts',
  Closed = 'Closed'
}

export enum WorkOrderPriority {
  Aog = 'AOG',
  Expedite = 'Expedite',
  Routine = 'Routine'
}

export interface ModuleCondition {
  module: string;
  state: EngineState;
  cyclesSinceOverhaul: number;
  limitCycles: number;
  note: string;
}

export interface Engine {
  esn: string;
  family: EngineFamily;
  operator: string;
  tailNumber: string;
  location: EngineLocation;
  state: EngineState;
  egtMargin: number;
  vibrationIps: number;
  oilConsumptionLph: number;
  flightHours: number;
  flightCycles: number;
  cyclesToShopVisit: number;
  lastFlight: string;
  hub: string;
  modules: ModuleCondition[];
}

export interface TrendPoint {
  date: string;
  egtMargin: number;
  vibrationIps: number;
  oilConsumptionLph: number;
}

export interface EngineTrend {
  esn: string;
  points: TrendPoint[];
}

export interface FleetAlert {
  id: string;
  esn: string;
  operator: string;
  state: EngineState;
  signal: string;
  detected: string;
  summary: string;
  recommendedAction: string;
}

export interface FleetStats {
  enginesManaged: number;
  onWing: number;
  inShopVisit: number;
  actNow: number;
  watchlist: number;
  availabilityPct: number;
  meanEgtMargin: number;
  aogOpen: number;
}

export interface WorkscopeOption {
  code: string;
  label: string;
  description: string;
  labourHours: number;
  materialCost: number;
  turnaroundDays: number;
}

export interface ShopVisitEstimate {
  labourHours: number;
  labourCost: number;
  materialCost: number;
  totalCost: number;
  turnaroundDays: number;
  restoredEgtMargin: number;
  cyclesRestored: number;
  breakdown: ShopVisitCostLine[];
}

export interface ShopVisitCostLine {
  label: string;
  cost: number;
  share: number;
}

export interface WorkOrder {
  id: string;
  esn: string;
  operator: string;
  title: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  facility: string;
  raisedBy: string;
  raisedOn: string;
  dueOn: string;
  labourHours: number;
  tasks: WorkOrderTask[];
}

export interface WorkOrderTask {
  reference: string;
  description: string;
  complete: boolean;
}

export interface WorkOrderRequest {
  esn: string;
  title: string;
  priority: WorkOrderPriority;
  facility: string;
  dueOn: string;
  findings: string;
  requestedTasks: string;
  requesterName: string;
  requesterEmail: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'alert' | 'shop-visit' | 'supply' | 'compliance';
}

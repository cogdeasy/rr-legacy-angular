import {
  Engine, EngineFamily, EngineLocation, EngineState, FleetAlert, WorkOrder, WorkOrderPriority, WorkOrderStatus, WorkscopeOption
} from '../models/engine';

export const engines: Engine[] = [
    {
      esn: 'ESN-10241',
      family: EngineFamily.Trent1000,
      operator: 'British Airways',
      tailNumber: 'G-ZBJC',
      location: EngineLocation.OnWing,
      state: EngineState.ActNow,
      egtMargin: 8,
      vibrationIps: 0.62,
      oilConsumptionLph: 0.41,
      flightHours: 24180,
      flightCycles: 4120,
      cyclesToShopVisit: 180,
      lastFlight: '2026-03-25T21:40:00Z',
      hub: 'London Heathrow',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 1180, limitCycles: 6000, note: 'Blade set within tip clearance limits.' },
        { module: 'IP compressor', state: EngineState.Watchlist, cyclesSinceOverhaul: 3980, limitCycles: 5200, note: 'Efficiency drift of 1.4% since last wash.' },
        { module: 'HP turbine', state: EngineState.ActNow, cyclesSinceOverhaul: 4980, limitCycles: 5000, note: 'Blade tip oxidation confirmed on borescope BS-8841.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 2210, limitCycles: 7000, note: 'No findings at last inspection.' }
      ]
    },
    {
      esn: 'ESN-10388',
      family: EngineFamily.TrentXWB,
      operator: 'Singapore Airlines',
      tailNumber: '9V-SMF',
      location: EngineLocation.OnWing,
      state: EngineState.Watchlist,
      egtMargin: 24,
      vibrationIps: 0.38,
      oilConsumptionLph: 0.22,
      flightHours: 15820,
      flightCycles: 2140,
      cyclesToShopVisit: 940,
      lastFlight: '2026-03-26T02:05:00Z',
      hub: 'Singapore Changi',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 2140, limitCycles: 6500, note: 'Nominal.' },
        { module: 'IP compressor', state: EngineState.Nominal, cyclesSinceOverhaul: 2140, limitCycles: 5600, note: 'Nominal.' },
        { module: 'HP turbine', state: EngineState.Watchlist, cyclesSinceOverhaul: 2140, limitCycles: 5400, note: 'EGT margin erosion 6 degC over 90 days.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 2140, limitCycles: 7200, note: 'Nominal.' }
      ]
    },
    {
      esn: 'ESN-10457',
      family: EngineFamily.Trent7000,
      operator: 'Emirates',
      tailNumber: 'A6-EOF',
      location: EngineLocation.ShopVisit,
      state: EngineState.ActNow,
      egtMargin: 4,
      vibrationIps: 0.71,
      oilConsumptionLph: 0.55,
      flightHours: 31240,
      flightCycles: 5310,
      cyclesToShopVisit: 0,
      lastFlight: '2026-03-04T18:22:00Z',
      hub: 'Dubai International',
      modules: [
        { module: 'Fan', state: EngineState.Watchlist, cyclesSinceOverhaul: 5310, limitCycles: 6000, note: 'Leading edge erosion on six blades.' },
        { module: 'IP compressor', state: EngineState.ActNow, cyclesSinceOverhaul: 5310, limitCycles: 5200, note: 'Stage 6 blend limit reached.' },
        { module: 'HP turbine', state: EngineState.ActNow, cyclesSinceOverhaul: 5310, limitCycles: 5000, note: 'Full refurbishment required.' },
        { module: 'IP turbine', state: EngineState.Watchlist, cyclesSinceOverhaul: 5310, limitCycles: 7000, note: 'Seal wear at upper tolerance.' }
      ]
    },
    {
      esn: 'ESN-10502',
      family: EngineFamily.Trent900,
      operator: 'Lufthansa',
      tailNumber: 'D-AIML',
      location: EngineLocation.OnWing,
      state: EngineState.Nominal,
      egtMargin: 47,
      vibrationIps: 0.21,
      oilConsumptionLph: 0.18,
      flightHours: 9840,
      flightCycles: 1180,
      cyclesToShopVisit: 2320,
      lastFlight: '2026-03-25T15:10:00Z',
      hub: 'Frankfurt',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 1180, limitCycles: 6000, note: 'Nominal.' },
        { module: 'IP compressor', state: EngineState.Nominal, cyclesSinceOverhaul: 1180, limitCycles: 5200, note: 'Nominal.' },
        { module: 'HP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 1180, limitCycles: 5000, note: 'Nominal.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 1180, limitCycles: 7000, note: 'Nominal.' }
      ]
    },
    {
      esn: 'ESN-10613',
      family: EngineFamily.Trent1000,
      operator: 'Virgin Atlantic',
      tailNumber: 'G-VNEW',
      location: EngineLocation.Spare,
      state: EngineState.Nominal,
      egtMargin: 52,
      vibrationIps: 0.19,
      oilConsumptionLph: 0.15,
      flightHours: 4210,
      flightCycles: 610,
      cyclesToShopVisit: 3910,
      lastFlight: '2026-02-11T09:35:00Z',
      hub: 'London Gatwick',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 610, limitCycles: 6000, note: 'Post-overhaul build.' },
        { module: 'IP compressor', state: EngineState.Nominal, cyclesSinceOverhaul: 610, limitCycles: 5200, note: 'Post-overhaul build.' },
        { module: 'HP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 610, limitCycles: 5000, note: 'Post-overhaul build.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 610, limitCycles: 7000, note: 'Post-overhaul build.' }
      ]
    },
    {
      esn: 'ESN-10744',
      family: EngineFamily.TrentXWB,
      operator: 'Qatar Airways',
      tailNumber: 'A7-ALZ',
      location: EngineLocation.OnWing,
      state: EngineState.Watchlist,
      egtMargin: 18,
      vibrationIps: 0.44,
      oilConsumptionLph: 0.31,
      flightHours: 19470,
      flightCycles: 2810,
      cyclesToShopVisit: 620,
      lastFlight: '2026-03-26T04:50:00Z',
      hub: 'Doha Hamad',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 2810, limitCycles: 6500, note: 'Nominal.' },
        { module: 'IP compressor', state: EngineState.Watchlist, cyclesSinceOverhaul: 2810, limitCycles: 5600, note: 'Sand ingestion exposure above fleet mean.' },
        { module: 'HP turbine', state: EngineState.Watchlist, cyclesSinceOverhaul: 2810, limitCycles: 5400, note: 'Coating loss trending to limit at 3400 cycles.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 2810, limitCycles: 7200, note: 'Nominal.' }
      ]
    },
    {
      esn: 'ESN-10812',
      family: EngineFamily.BR725,
      operator: 'Gulfstream Ops',
      tailNumber: 'N725GX',
      location: EngineLocation.OnWing,
      state: EngineState.NoData,
      egtMargin: 0,
      vibrationIps: 0,
      oilConsumptionLph: 0,
      flightHours: 6120,
      flightCycles: 3040,
      cyclesToShopVisit: 1460,
      lastFlight: '2026-03-19T13:05:00Z',
      hub: 'Farnborough',
      modules: [
        { module: 'Fan', state: EngineState.NoData, cyclesSinceOverhaul: 3040, limitCycles: 6000, note: 'Telemetry link offline since 19 March.' },
        { module: 'IP compressor', state: EngineState.NoData, cyclesSinceOverhaul: 3040, limitCycles: 5200, note: 'Telemetry link offline since 19 March.' },
        { module: 'HP turbine', state: EngineState.NoData, cyclesSinceOverhaul: 3040, limitCycles: 5000, note: 'Telemetry link offline since 19 March.' },
        { module: 'IP turbine', state: EngineState.NoData, cyclesSinceOverhaul: 3040, limitCycles: 7000, note: 'Telemetry link offline since 19 March.' }
      ]
    },
    {
      esn: 'ESN-10938',
      family: EngineFamily.Trent7000,
      operator: 'Air Canada',
      tailNumber: 'C-GKUM',
      location: EngineLocation.Quarantine,
      state: EngineState.ActNow,
      egtMargin: 11,
      vibrationIps: 0.83,
      oilConsumptionLph: 0.62,
      flightHours: 21050,
      flightCycles: 3760,
      cyclesToShopVisit: 40,
      lastFlight: '2026-03-22T23:15:00Z',
      hub: 'Toronto Pearson',
      modules: [
        { module: 'Fan', state: EngineState.Nominal, cyclesSinceOverhaul: 3760, limitCycles: 6000, note: 'Nominal.' },
        { module: 'IP compressor', state: EngineState.Watchlist, cyclesSinceOverhaul: 3760, limitCycles: 5200, note: 'Vibration signature shifted after bird strike event.' },
        { module: 'HP turbine', state: EngineState.ActNow, cyclesSinceOverhaul: 3760, limitCycles: 5000, note: 'Awaiting disposition from engineering.' },
        { module: 'IP turbine', state: EngineState.Nominal, cyclesSinceOverhaul: 3760, limitCycles: 7000, note: 'Nominal.' }
      ]
    }
  ];

export const alerts: FleetAlert[] = [
    {
      id: 'ALT-7741',
      esn: 'ESN-10241',
      operator: 'British Airways',
      state: EngineState.ActNow,
      signal: 'EGT margin',
      detected: '2026-03-25T22:10:00Z',
      summary: 'EGT margin fell to 8 degC, 12 degC below the operator alert threshold.',
      recommendedAction: 'Schedule HP turbine refurbishment at the next Heathrow night stop.'
    },
    {
      id: 'ALT-7738',
      esn: 'ESN-10938',
      operator: 'Air Canada',
      state: EngineState.ActNow,
      signal: 'Vibration',
      detected: '2026-03-23T01:44:00Z',
      summary: 'Broadband vibration of 0.83 ips after a confirmed bird strike on departure.',
      recommendedAction: 'Hold in quarantine pending engineering disposition of the HP turbine.'
    },
    {
      id: 'ALT-7729',
      esn: 'ESN-10744',
      operator: 'Qatar Airways',
      state: EngineState.Watchlist,
      signal: 'Coating loss',
      detected: '2026-03-21T09:02:00Z',
      summary: 'HP turbine coating loss projected to reach limit at 3,400 cycles.',
      recommendedAction: 'Add to the Doha borescope plan within 45 days.'
    },
    {
      id: 'ALT-7715',
      esn: 'ESN-10388',
      operator: 'Singapore Airlines',
      state: EngineState.Watchlist,
      signal: 'EGT margin',
      detected: '2026-03-18T11:27:00Z',
      summary: 'Margin erosion of 6 degC over 90 days, ahead of the family baseline.',
      recommendedAction: 'Book a compressor wash at Changi and re-baseline the trend.'
    },
    {
      id: 'ALT-7702',
      esn: 'ESN-10812',
      operator: 'Gulfstream Ops',
      state: EngineState.NoData,
      signal: 'Telemetry',
      detected: '2026-03-19T13:20:00Z',
      summary: 'No engine health downlink received for seven consecutive flights.',
      recommendedAction: 'Raise a line task to check the EHM unit and aircraft data bus.'
    }
  ];

export const workscopeOptions: WorkscopeOption[] = [
    {
      code: 'WS-LLP',
      label: 'Life limited parts replacement',
      description: 'Replace discs and shafts that have reached their certified cycle limits.',
      labourHours: 640,
      materialCost: 1850000,
      turnaroundDays: 22
    },
    {
      code: 'WS-HPT',
      label: 'HP turbine refurbishment',
      description: 'Strip, inspect and re-blade the HP turbine, restoring the bulk of EGT margin.',
      labourHours: 480,
      materialCost: 1240000,
      turnaroundDays: 18
    },
    {
      code: 'WS-IPC',
      label: 'IP compressor overhaul',
      description: 'Blend, re-coat and re-stack the IP compressor to recover efficiency.',
      labourHours: 320,
      materialCost: 610000,
      turnaroundDays: 12
    },
    {
      code: 'WS-FAN',
      label: 'Fan module restoration',
      description: 'Fan blade set exchange and containment case inspection.',
      labourHours: 210,
      materialCost: 380000,
      turnaroundDays: 9
    },
    {
      code: 'WS-TEST',
      label: 'Test cell pass-off',
      description: 'Post-build performance run and acceptance certification.',
      labourHours: 90,
      materialCost: 145000,
      turnaroundDays: 4
    }
  ];

export const workOrders: WorkOrder[] = [
    {
      id: 'WO-30411',
      esn: 'ESN-10457',
      operator: 'Emirates',
      title: 'Full performance restoration shop visit',
      priority: WorkOrderPriority.Expedite,
      status: WorkOrderStatus.InWork,
      facility: 'Dahlewitz',
      raisedBy: 'Alice Whitmore',
      raisedOn: '2026-03-06T08:30:00Z',
      dueOn: '2026-04-18',
      labourHours: 1180,
      tasks: [
        { reference: 'TC-1002', description: 'Strip HP turbine and record build standard', complete: true },
        { reference: 'TC-1014', description: 'Blend IP compressor stage 6 blades', complete: true },
        { reference: 'TC-1027', description: 'Re-blade HP turbine with service bulletin SB-72-K118', complete: false },
        { reference: 'TC-1044', description: 'Test cell pass-off run', complete: false }
      ]
    },
    {
      id: 'WO-30428',
      esn: 'ESN-10938',
      operator: 'Air Canada',
      title: 'Post bird strike engineering disposition',
      priority: WorkOrderPriority.Aog,
      status: WorkOrderStatus.AwaitingParts,
      facility: 'Toronto line station',
      raisedBy: 'Marcus Reid',
      raisedOn: '2026-03-23T02:15:00Z',
      dueOn: '2026-03-29',
      labourHours: 96,
      tasks: [
        { reference: 'TC-2201', description: 'Borescope fan and IP compressor', complete: true },
        { reference: 'TC-2208', description: 'Vibration survey at idle and cruise power', complete: true },
        { reference: 'TC-2215', description: 'Fit replacement fan blade set', complete: false }
      ]
    },
    {
      id: 'WO-30433',
      esn: 'ESN-10241',
      operator: 'British Airways',
      title: 'HP turbine borescope follow-up',
      priority: WorkOrderPriority.Routine,
      status: WorkOrderStatus.Raised,
      facility: 'Heathrow line station',
      raisedBy: 'Alice Whitmore',
      raisedOn: '2026-03-25T23:05:00Z',
      dueOn: '2026-04-06',
      labourHours: 32,
      tasks: [
        { reference: 'TC-3310', description: 'Repeat borescope of HP turbine stage 1', complete: false },
        { reference: 'TC-3318', description: 'Download EHM snapshot and re-baseline trend', complete: false }
      ]
    },
    {
      id: 'WO-30402',
      esn: 'ESN-10388',
      operator: 'Singapore Airlines',
      title: 'On-wing compressor wash',
      priority: WorkOrderPriority.Routine,
      status: WorkOrderStatus.Closed,
      facility: 'Changi line station',
      raisedBy: 'Priya Nathan',
      raisedOn: '2026-02-28T10:00:00Z',
      dueOn: '2026-03-10',
      labourHours: 18,
      tasks: [
        { reference: 'TC-4102', description: 'Water wash IP and HP compressors', complete: true },
        { reference: 'TC-4109', description: 'Record post-wash EGT margin', complete: true }
      ]
    }
  ];

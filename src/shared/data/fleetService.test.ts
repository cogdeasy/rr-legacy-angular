import { describe, expect, it } from 'vitest';
import { estimateShopVisit, getEngines, getTrend, submitWorkOrder } from './fleetService';
import { WorkOrderPriority, WorkOrderStatus } from '../models/engine';

describe('fleetService', () => {
  it('returns the managed engine fleet', async () => {
    const engines = await getEngines();
    expect(engines.length).toBeGreaterThan(0);
    expect(engines[0].esn).toContain('ESN-');
  });

  it('builds twelve months of trend points', async () => {
    const trend = await getTrend('ESN-10241');
    expect(trend.esn).toBe('ESN-10241');
    expect(trend.points.length).toBe(12);
  });

  it('returns a zero estimate when no workscope is selected', () => {
    const estimate = estimateShopVisit([], 1);
    expect(estimate.totalCost).toBe(0);
    expect(estimate.breakdown.length).toBe(0);
  });

  it('scales the estimate by the facility factor', () => {
    const derby = estimateShopVisit(['WS-HPT'], 1);
    const partner = estimateShopVisit(['WS-HPT'], 1.16);
    expect(partner.totalCost).toBeGreaterThan(derby.totalCost);
    expect(partner.restoredEgtMargin).toBe(derby.restoredEgtMargin);
  });

  it('raises a work order in the raised state', async () => {
    const order = await submitWorkOrder({
      esn: 'ESN-10241',
      title: 'HP turbine borescope rectification',
      priority: WorkOrderPriority.Expedite,
      facility: 'Derby',
      dueOn: '2026-04-12',
      findings: 'Stage 1 NGV distress observed at borescope.',
      requestedTasks: 'Replace stage 1 NGV set\nRepeat borescope',
      requesterName: 'Alice Whitmore',
      requesterEmail: 'alice.whitmore@rolls-royce.com'
    });

    expect(order.status).toBe(WorkOrderStatus.Raised);
    expect(order.tasks.length).toBe(2);
    expect(order.operator.length).toBeGreaterThan(0);
  });
});

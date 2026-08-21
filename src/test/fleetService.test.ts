import { fleetService } from '../shared/data/fleetService';
import { WorkOrderPriority, WorkOrderStatus } from '../shared/models/engine';

describe('fleet service', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the deterministic managed engine fleet', async () => {
    vi.useFakeTimers();
    const promise = fleetService.getEngines();
    await vi.advanceTimersByTimeAsync(600);
    const result = await promise;

    expect(result).toHaveLength(8);
    expect(result[0].esn).toBe('ESN-10241');
    expect(result[0].operator).toBe('British Airways');
  });

  it('builds twelve deterministic trend points', async () => {
    vi.useFakeTimers();
    const promise = fleetService.getTrend('ESN-10241');
    await vi.advanceTimersByTimeAsync(450);
    const result = await promise;

    expect(result.esn).toBe('ESN-10241');
    expect(result.points).toHaveLength(12);
    expect(result.points[0].date).toBe('Apr');
    expect(result.points[11].date).toBe('Mar');
  });

  it('returns a zero estimate without a selected workscope', () => {
    const estimate = fleetService.estimateShopVisit([], 1);

    expect(estimate.totalCost).toBe(0);
    expect(estimate.breakdown).toHaveLength(0);
    expect(estimate.restoredEgtMargin).toBe(0);
  });

  it('preserves the workscope calculation and scales facility cost', () => {
    const derby = fleetService.estimateShopVisit(['WS-HPT', 'WS-TEST'], 1);
    const partner = fleetService.estimateShopVisit(
      ['WS-HPT', 'WS-TEST'],
      1.16
    );

    expect(derby).toMatchObject({
      labourHours: 570,
      labourCost: 67260,
      materialCost: 1385000,
      totalCost: 1452260,
      turnaroundDays: 25,
      restoredEgtMargin: 34,
      cyclesRestored: 3200
    });
    expect(partner.totalCost).toBeGreaterThan(derby.totalCost);
    expect(partner.restoredEgtMargin).toBe(derby.restoredEgtMargin);
  });

  it('creates raised work with task cards after the service delay', async () => {
    vi.useFakeTimers();
    const promise = fleetService.submitWorkOrder({
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
    await vi.advanceTimersByTimeAsync(900);
    const order = await promise;

    expect(order.status).toBe(WorkOrderStatus.Raised);
    expect(order.tasks).toHaveLength(2);
    expect(order.operator).toBe('British Airways');
  });
});

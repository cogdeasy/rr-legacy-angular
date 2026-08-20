import { TestBed } from '@angular/core/testing';
import { WorkOrderPriority, WorkOrderStatus } from '../models/engine.model';
import { FleetService } from './fleet.service';

describe('FleetService', () => {
  let service: FleetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FleetService);
  });

  it('returns the managed engine fleet', done => {
    service.getEngines().subscribe(engines => {
      expect(engines.length).toBeGreaterThan(0);
      expect(engines[0].esn).toContain('ESN-');
      done();
    });
  });

  it('builds twelve months of trend points', done => {
    service.getTrend('ESN-10241').subscribe(trend => {
      expect(trend.esn).toBe('ESN-10241');
      expect(trend.points.length).toBe(12);
      done();
    });
  });

  it('returns a zero estimate when no workscope is selected', () => {
    const estimate = service.estimateShopVisit([], 1);
    expect(estimate.totalCost).toBe(0);
    expect(estimate.breakdown.length).toBe(0);
  });

  it('scales the estimate by the facility factor', () => {
    const derby = service.estimateShopVisit(['WS-HPT'], 1);
    const partner = service.estimateShopVisit(['WS-HPT'], 1.16);
    expect(partner.totalCost).toBeGreaterThan(derby.totalCost);
    expect(partner.restoredEgtMargin).toBe(derby.restoredEgtMargin);
  });

  it('raises a work order in the raised state', done => {
    service
      .submitWorkOrder({
        esn: 'ESN-10241',
        title: 'HP turbine borescope rectification',
        priority: WorkOrderPriority.Expedite,
        facility: 'Derby',
        dueOn: '2026-04-12',
        findings: 'Stage 1 NGV distress observed at borescope.',
        requestedTasks: 'Replace stage 1 NGV set\nRepeat borescope',
        requesterName: 'Alice Whitmore',
        requesterEmail: 'alice.whitmore@rolls-royce.com'
      })
      .subscribe(order => {
        expect(order.status).toBe(WorkOrderStatus.Raised);
        expect(order.tasks.length).toBe(2);
        expect(order.operator.length).toBeGreaterThan(0);
        done();
      });
  });
});

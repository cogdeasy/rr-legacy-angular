import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import {
  Engine,
  WorkOrder,
  WorkOrderPriority,
  WorkOrderStatus
} from '../../shared/models/engine.model';
import { AuthService } from '../../shared/services/auth.service';
import { FleetService } from '../../shared/services/fleet.service';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrls: ['./work-orders.component.scss']
})
export class WorkOrdersComponent implements OnInit {
  workOrders: WorkOrder[] = [];
  engines: Engine[] = [];
  isLoading = true;
  isSubmitting = false;
  showForm = false;
  submittedId: string | null = null;
  expandedId: string | null = null;

  searchTerm = '';
  selectedStatus: WorkOrderStatus | 'All' = 'All';

  readonly statuses: (WorkOrderStatus | 'All')[] = [
    'All',
    WorkOrderStatus.Raised,
    WorkOrderStatus.InWork,
    WorkOrderStatus.AwaitingParts,
    WorkOrderStatus.Closed
  ];

  readonly priorities: WorkOrderPriority[] = [
    WorkOrderPriority.Aog,
    WorkOrderPriority.Expedite,
    WorkOrderPriority.Routine
  ];

  readonly facilities = ['Derby', 'Dahlewitz', 'Singapore', 'Dallas partner shop'];

  form: FormGroup;

  constructor(
    private fleetService: FleetService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      esn: ['', Validators.required],
      title: ['', [Validators.required, Validators.minLength(8)]],
      priority: [WorkOrderPriority.Routine, Validators.required],
      facility: ['Derby', Validators.required],
      dueOn: ['', Validators.required],
      findings: ['', [Validators.required, Validators.minLength(12)]],
      requestedTasks: ['', Validators.required],
      requesterName: ['', Validators.required],
      requesterEmail: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    forkJoin({
      workOrders: this.fleetService.getWorkOrders(),
      engines: this.fleetService.getEngines()
    }).subscribe(result => {
      this.workOrders = result.workOrders;
      this.engines = result.engines;
      this.isLoading = false;
    });

    const user = this.authService.currentUser;
    if (user) {
      this.form.patchValue({
        requesterName: `${user.firstName} ${user.lastName}`,
        requesterEmail: user.email
      });
    }
  }

  get filteredWorkOrders(): WorkOrder[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.workOrders.filter(order => {
      const matchesStatus = this.selectedStatus === 'All' || order.status === this.selectedStatus;
      const matchesTerm =
        term.length === 0 ||
        order.id.toLowerCase().indexOf(term) > -1 ||
        order.esn.toLowerCase().indexOf(term) > -1 ||
        order.operator.toLowerCase().indexOf(term) > -1 ||
        order.title.toLowerCase().indexOf(term) > -1;
      return matchesStatus && matchesTerm;
    });
  }

  get openCount(): number {
    return this.workOrders.filter(order => order.status !== WorkOrderStatus.Closed).length;
  }

  get aogCount(): number {
    return this.workOrders.filter(
      order => order.priority === WorkOrderPriority.Aog && order.status !== WorkOrderStatus.Closed
    ).length;
  }

  get awaitingPartsCount(): number {
    return this.workOrders.filter(order => order.status === WorkOrderStatus.AwaitingParts).length;
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.submittedId = null;
  }

  toggleOrder(id: string): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  statusClass(status: WorkOrderStatus): string {
    switch (status) {
      case WorkOrderStatus.Closed:
        return 'state-nominal';
      case WorkOrderStatus.AwaitingParts:
        return 'state-watchlist';
      case WorkOrderStatus.InWork:
        return 'state-info';
      default:
        return 'state-no-data';
    }
  }

  priorityClass(priority: WorkOrderPriority): string {
    switch (priority) {
      case WorkOrderPriority.Aog:
        return 'state-act-now';
      case WorkOrderPriority.Expedite:
        return 'state-watchlist';
      default:
        return 'state-no-data';
    }
  }

  taskProgress(order: WorkOrder): number {
    if (order.tasks.length === 0) {
      return 0;
    }
    const complete = order.tasks.filter(task => task.complete).length;
    return Math.round((complete / order.tasks.length) * 100);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.fleetService.submitWorkOrder(this.form.value).subscribe(order => {
      this.workOrders = [order, ...this.workOrders];
      this.submittedId = order.id;
      this.isSubmitting = false;
      this.showForm = false;
      this.expandedId = order.id;
      this.notificationService.push({
        title: `${order.id} raised`,
        message: `${order.title} routed to ${order.facility} for ${order.esn}.`,
        category: 'shop-visit'
      });
      this.form.patchValue({ title: '', findings: '', requestedTasks: '', dueOn: '' });
      this.form.markAsUntouched();
    });
  }

  hasError(control: string): boolean {
    const field = this.form.get(control);
    return !!field && field.invalid && field.touched;
  }
}

import { FormEvent, useMemo, useState } from 'react';
import { Icon } from '../shared/components/Icon';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useAuth } from '../shared/auth/useAuth';
import {
  getEngines,
  getWorkOrders,
  submitWorkOrder,
  useWorkOrdersStore
} from '../shared/data/fleetService';
import { formatDate } from '../shared/lib/date';
import { engineHours } from '../shared/lib/format';
import { useAsync } from '../shared/lib/useAsync';
import { pushNotification } from '../shared/notifications/notificationStore';
import {
  WorkOrder,
  WorkOrderPriority,
  WorkOrderRequest,
  WorkOrderStatus
} from '../shared/models/engine';
import './work-orders.scss';

const statuses: (WorkOrderStatus | 'All')[] = [
  'All',
  WorkOrderStatus.Raised,
  WorkOrderStatus.InWork,
  WorkOrderStatus.AwaitingParts,
  WorkOrderStatus.Closed
];

const priorities: WorkOrderPriority[] = [
  WorkOrderPriority.Aog,
  WorkOrderPriority.Expedite,
  WorkOrderPriority.Routine
];

const facilities = ['Derby', 'Dahlewitz', 'Singapore', 'Dallas partner shop'];

const statusClass = (status: WorkOrderStatus): string => {
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
};

const priorityClass = (priority: WorkOrderPriority): string => {
  switch (priority) {
    case WorkOrderPriority.Aog:
      return 'state-act-now';
    case WorkOrderPriority.Expedite:
      return 'state-watchlist';
    default:
      return 'state-no-data';
  }
};

const taskProgress = (order: WorkOrder): number => {
  if (order.tasks.length === 0) {
    return 0;
  }
  const complete = order.tasks.filter(task => task.complete).length;
  return Math.round((complete / order.tasks.length) * 100);
};

type FormErrors = Partial<Record<keyof WorkOrderRequest, boolean>>;

const validate = (form: WorkOrderRequest): FormErrors => ({
  esn: form.esn.length === 0,
  title: form.title.trim().length < 8,
  dueOn: form.dueOn.length === 0,
  findings: form.findings.trim().length < 12,
  requestedTasks: form.requestedTasks.trim().length === 0,
  requesterName: form.requesterName.trim().length === 0,
  requesterEmail: !/^\S+@\S+\.\S+$/.test(form.requesterEmail)
});

export default function WorkOrdersPage() {
  const { currentUser } = useAuth();
  const { data, isLoading } = useAsync(
    () => Promise.all([getWorkOrders(), getEngines()]),
    []
  );
  const engines = data ? data[1] : [];
  const workOrders = useWorkOrdersStore();

  const [form, setForm] = useState<WorkOrderRequest>({
    esn: '',
    title: '',
    priority: WorkOrderPriority.Routine,
    facility: 'Derby',
    dueOn: '',
    findings: '',
    requestedTasks: '',
    requesterName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    requesterEmail: currentUser ? currentUser.email : ''
  });
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | 'All'>('All');

  const errors = validate(form);
  const hasError = (field: keyof WorkOrderRequest) => touched && errors[field] === true;
  const isInvalid = Object.values(errors).some(Boolean);

  const filteredWorkOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return workOrders.filter(order => {
      const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
      const matchesTerm =
        term.length === 0 ||
        order.id.toLowerCase().indexOf(term) > -1 ||
        order.esn.toLowerCase().indexOf(term) > -1 ||
        order.operator.toLowerCase().indexOf(term) > -1 ||
        order.title.toLowerCase().indexOf(term) > -1;
      return matchesStatus && matchesTerm;
    });
  }, [workOrders, searchTerm, selectedStatus]);

  const openCount = workOrders.filter(order => order.status !== WorkOrderStatus.Closed).length;
  const aogCount = workOrders.filter(
    order => order.priority === WorkOrderPriority.Aog && order.status !== WorkOrderStatus.Closed
  ).length;
  const awaitingPartsCount = workOrders.filter(
    order => order.status === WorkOrderStatus.AwaitingParts
  ).length;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isInvalid) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);
    submitWorkOrder(form).then(order => {
      setSubmittedId(order.id);
      setIsSubmitting(false);
      setShowForm(false);
      setExpandedId(order.id);
      pushNotification({
        title: `${order.id} raised`,
        message: `${order.title} routed to ${order.facility} for ${order.esn}.`,
        category: 'shop-visit'
      });
      setForm(current => ({ ...current, title: '', findings: '', requestedTasks: '', dueOn: '' }));
      setTouched(false);
    });
  };

  const update = (changes: Partial<WorkOrderRequest>) =>
    setForm(current => ({ ...current, ...changes }));

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Work orders</span>
          <h1>Maintenance execution</h1>
          <p>Track raised work, chase parts, and route new findings to a facility.</p>
        </div>
        <button
          type="button"
          className="rr-button primary pill-cta"
          onClick={() => {
            setShowForm(current => !current);
            setSubmittedId(null);
          }}
        >
          <Icon name={showForm ? 'close' : 'add'} />
          {showForm ? 'Cancel' : 'Raise work order'}
        </button>
      </div>

      {submittedId && (
        <div className="confirmation panel">
          <Icon name="task_alt" />
          <span>{submittedId} raised and routed to the facility planning queue.</span>
        </div>
      )}

      <LoadingSpinner isLoading={isLoading} message="Loading work orders…" />

      {!isLoading && (
        <div>
          <div className="stat-row">
            <div className="panel stat">
              <span className="micro-label">Open</span>
              <strong className="numeric">{openCount}</strong>
            </div>
            <div className="panel stat">
              <span className="micro-label">AOG</span>
              <strong className="numeric act">{aogCount}</strong>
            </div>
            <div className="panel stat">
              <span className="micro-label">Awaiting parts</span>
              <strong className="numeric watch">{awaitingPartsCount}</strong>
            </div>
            <div className="panel stat">
              <span className="micro-label">Total raised</span>
              <strong className="numeric">{workOrders.length}</strong>
            </div>
          </div>

          {showForm && (
            <form className="panel raise-form" onSubmit={onSubmit} noValidate>
              <span className="micro-label">New work order</span>

              <div className="form-grid">
                <label className="field">
                  <span className="field-label">Engine serial number</span>
                  <select value={form.esn} onChange={event => update({ esn: event.target.value })}>
                    <option value="" disabled>
                      Select an engine
                    </option>
                    {engines.map(engine => (
                      <option value={engine.esn} key={engine.esn}>
                        {engine.esn} — {engine.operator}
                      </option>
                    ))}
                  </select>
                  {hasError('esn') && (
                    <span className="field-error">Select the engine this work applies to.</span>
                  )}
                </label>

                <label className="field">
                  <span className="field-label">Title</span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={event => update({ title: event.target.value })}
                    placeholder="e.g. HP turbine borescope rectification"
                  />
                  {hasError('title') && (
                    <span className="field-error">Give the work order a descriptive title.</span>
                  )}
                </label>

                <label className="field">
                  <span className="field-label">Priority</span>
                  <select
                    value={form.priority}
                    onChange={event =>
                      update({ priority: event.target.value as WorkOrderPriority })
                    }
                  >
                    {priorities.map(priority => (
                      <option value={priority} key={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Facility</span>
                  <select
                    value={form.facility}
                    onChange={event => update({ facility: event.target.value })}
                  >
                    {facilities.map(facility => (
                      <option value={facility} key={facility}>
                        {facility}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field-label">Due date</span>
                  <input
                    type="date"
                    value={form.dueOn}
                    onChange={event => update({ dueOn: event.target.value })}
                  />
                  {hasError('dueOn') && <span className="field-error">A due date is required.</span>}
                </label>

                <label className="field">
                  <span className="field-label">Raised by</span>
                  <input
                    type="text"
                    value={form.requesterName}
                    onChange={event => update({ requesterName: event.target.value })}
                  />
                  {hasError('requesterName') && (
                    <span className="field-error">Enter the requester name.</span>
                  )}
                </label>

                <label className="field">
                  <span className="field-label">Contact email</span>
                  <input
                    type="email"
                    value={form.requesterEmail}
                    onChange={event => update({ requesterEmail: event.target.value })}
                  />
                  {hasError('requesterEmail') && (
                    <span className="field-error">Enter a valid contact email.</span>
                  )}
                </label>
              </div>

              <label className="field wide">
                <span className="field-label">Findings</span>
                <textarea
                  rows={3}
                  value={form.findings}
                  onChange={event => update({ findings: event.target.value })}
                  placeholder="Borescope, downlink or line findings supporting this work order"
                />
                {hasError('findings') && (
                  <span className="field-error">Record the supporting findings.</span>
                )}
              </label>

              <label className="field wide">
                <span className="field-label">Requested tasks (one per line)</span>
                <textarea
                  rows={4}
                  value={form.requestedTasks}
                  onChange={event => update({ requestedTasks: event.target.value })}
                  placeholder="Remove and replace HPT stage 1 nozzle guide vanes"
                />
                {hasError('requestedTasks') && (
                  <span className="field-error">List at least one task.</span>
                )}
              </label>

              <div className="form-actions">
                <button type="submit" className="rr-button primary pill-cta" disabled={isSubmitting}>
                  {isSubmitting ? 'Raising…' : 'Raise work order'}
                </button>
              </div>
            </form>
          )}

          <div className="filter-bar panel">
            <div className="search-field">
              <Icon name="search" />
              <input
                type="text"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by work order, ESN, operator or title"
              />
            </div>
            <div className="chip-row">
              {statuses.map(status => (
                <button
                  type="button"
                  key={status}
                  className={status === selectedStatus ? 'chip selected' : 'chip'}
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="order-list">
            {filteredWorkOrders.map(order => (
              <article className="panel order-card" key={order.id}>
                <header
                  className="order-head"
                  onClick={() => setExpandedId(current => (current === order.id ? null : order.id))}
                >
                  <div className="order-identity">
                    <span className="micro-label">{order.id}</span>
                    <h2>{order.title}</h2>
                    <span className="order-sub">
                      {order.esn} · {order.operator} · {order.facility}
                    </span>
                  </div>
                  <div className="order-meta">
                    <span className={`status-pill ${priorityClass(order.priority)}`}>
                      {order.priority}
                    </span>
                    <span className={`status-pill ${statusClass(order.status)}`}>{order.status}</span>
                    <span className="due">Due {order.dueOn}</span>
                    <Icon name={expandedId === order.id ? 'expand_less' : 'expand_more'} />
                  </div>
                </header>

                <div className="order-progress">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${taskProgress(order)}%` }} />
                  </div>
                  <span className="progress-value numeric">{taskProgress(order)}% tasks complete</span>
                </div>

                {expandedId === order.id && (
                  <div className="order-detail">
                    <div className="detail-facts">
                      <div>
                        <span className="micro-label">Raised by</span>
                        <strong>{order.raisedBy}</strong>
                      </div>
                      <div>
                        <span className="micro-label">Raised on</span>
                        <strong>{formatDate(order.raisedOn, 'dd MMM yyyy')}</strong>
                      </div>
                      <div>
                        <span className="micro-label">Labour booked</span>
                        <strong className="numeric">{engineHours(order.labourHours)}</strong>
                      </div>
                    </div>

                    <table className="rr-table">
                      <thead>
                        <tr>
                          <th>Task card</th>
                          <th>Description</th>
                          <th>State</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.tasks.map(task => (
                          <tr key={task.reference}>
                            <td>{task.reference}</td>
                            <td>{task.description}</td>
                            <td>
                              <span
                                className={`status-pill ${
                                  task.complete ? 'state-nominal' : 'state-no-data'
                                }`}
                              >
                                {task.complete ? 'Complete' : 'Open'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {order.tasks.length === 0 && (
                          <tr>
                            <td colSpan={3} className="empty-cell">
                              No task cards issued yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            ))}

            {filteredWorkOrders.length === 0 && (
              <div className="panel empty-state">
                <Icon name="inbox" />
                <p>No work orders match the current filters.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

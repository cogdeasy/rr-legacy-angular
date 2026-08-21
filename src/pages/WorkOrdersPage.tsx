import { FormEvent, useState } from 'react';
import { fleetService } from '../shared/data/fleetService';
import { useAsync } from '../shared/lib/async';
import { engineHours } from '../shared/lib/format';
import { formatDate } from '../shared/lib/date';
import { WorkOrder, WorkOrderPriority, WorkOrderRequest, WorkOrderStatus } from '../shared/models/engine';
import { useAuth } from '../shared/auth/useAuth';
import { useNotifications } from '../shared/notifications/notificationStore';
import { Icon } from '../shared/components/Icon';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import './work-orders.scss';

type WorkOrderForm = WorkOrderRequest;
const initialForm = (name: string, email: string): WorkOrderForm => ({
  esn: '', title: '', priority: WorkOrderPriority.Routine, facility: 'Derby', dueOn: '',
  findings: '', requestedTasks: '', requesterName: name, requesterEmail: email
});

export default function WorkOrdersPage() {
  const { currentUser } = useAuth();
  const { push } = useNotifications();
  const loaded = useAsync(() => Promise.all([fleetService.getWorkOrders(), fleetService.getEngines()]).then(([workOrders, engines]) => ({ workOrders, engines })), []);
  const [localOrders, setLocalOrders] = useState<WorkOrder[] | null>(null);
  const workOrders = localOrders ?? loaded.data?.workOrders ?? [];
  const engines = loaded.data?.engines ?? [];
  const [form, setForm] = useState<WorkOrderForm>(() => initialForm(currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '', currentUser?.email ?? ''));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<WorkOrderStatus | 'All'>('All');
  const statuses: (WorkOrderStatus | 'All')[] = ['All', WorkOrderStatus.Raised, WorkOrderStatus.InWork, WorkOrderStatus.AwaitingParts, WorkOrderStatus.Closed];
  const priorities: WorkOrderPriority[] = [WorkOrderPriority.Aog, WorkOrderPriority.Expedite, WorkOrderPriority.Routine];
  const facilities = ['Derby', 'Dahlewitz', 'Singapore', 'Dallas partner shop'];
  const term = searchTerm.trim().toLowerCase();
  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesTerm = term.length === 0 || order.id.toLowerCase().indexOf(term) > -1 || order.esn.toLowerCase().indexOf(term) > -1 || order.operator.toLowerCase().indexOf(term) > -1 || order.title.toLowerCase().indexOf(term) > -1;
    return matchesStatus && matchesTerm;
  });
  const openCount = workOrders.filter((order) => order.status !== WorkOrderStatus.Closed).length;
  const aogCount = workOrders.filter((order) => order.priority === WorkOrderPriority.Aog && order.status !== WorkOrderStatus.Closed).length;
  const awaitingPartsCount = workOrders.filter((order) => order.status === WorkOrderStatus.AwaitingParts).length;
  const updateField = <K extends keyof WorkOrderForm>(field: K, value: WorkOrderForm[K]) => setForm((current) => ({ ...current, [field]: value }));
  const isInvalid = (field: keyof WorkOrderForm): boolean => {
    if (field === 'title') return form.title.length < 8;
    if (field === 'findings') return form.findings.length < 12;
    if (field === 'requesterEmail') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.requesterEmail);
    return !String(form[field]).trim();
  };
  const hasError = (field: keyof WorkOrderForm): boolean => touched[field] === true && isInvalid(field);
  const statusClass = (status: WorkOrderStatus): string => status === WorkOrderStatus.Closed ? 'state-nominal' : status === WorkOrderStatus.AwaitingParts ? 'state-watchlist' : status === WorkOrderStatus.InWork ? 'state-info' : 'state-no-data';
  const priorityClass = (priority: WorkOrderPriority): string => priority === WorkOrderPriority.Aog ? 'state-act-now' : priority === WorkOrderPriority.Expedite ? 'state-watchlist' : 'state-no-data';
  const taskProgress = (order: WorkOrder): number => order.tasks.length === 0 ? 0 : Math.round((order.tasks.filter((task) => task.complete).length / order.tasks.length) * 100);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const fields: (keyof WorkOrderForm)[] = ['esn', 'title', 'dueOn', 'findings', 'requestedTasks', 'requesterName', 'requesterEmail'];
    const nextTouched = fields.reduce((all, field) => ({ ...all, [field]: true }), touched);
    setTouched(nextTouched);
    if (fields.some((field) => isInvalid(field))) return;
    setIsSubmitting(true);
    void fleetService.submitWorkOrder(form).then((order) => {
      setLocalOrders([order, ...workOrders]);
      setSubmittedId(order.id);
      setIsSubmitting(false);
      setShowForm(false);
      setExpandedId(order.id);
      push({ title: `${order.id} raised`, message: `${order.title} routed to ${order.facility} for ${order.esn}.`, category: 'shop-visit' });
      setForm((current) => ({ ...current, title: '', findings: '', requestedTasks: '', dueOn: '' }));
      setTouched({});
    });
  };

  return (
    <>
      <div className="page-header"><div><span className="micro-label">Work orders</span><h1>Maintenance execution</h1><p>Track raised work, chase parts, and route new findings to a facility.</p></div><button className="rr-button rr-button-flat pill-cta" onClick={() => { setShowForm(!showForm); setSubmittedId(null); }}><Icon>{showForm ? 'close' : 'add'}</Icon>{showForm ? 'Cancel' : 'Raise work order'}</button></div>
      {submittedId && <div className="confirmation panel"><Icon>task_alt</Icon><span>{submittedId} raised and routed to the facility planning queue.</span></div>}
      <LoadingSpinner isLoading={loaded.isLoading} message="Loading work orders…" />
      {!loaded.isLoading && <div>
        <div className="stat-row"><div className="panel stat"><span className="micro-label">Open</span><strong className="numeric">{openCount}</strong></div><div className="panel stat"><span className="micro-label">AOG</span><strong className="numeric act">{aogCount}</strong></div><div className="panel stat"><span className="micro-label">Awaiting parts</span><strong className="numeric watch">{awaitingPartsCount}</strong></div><div className="panel stat"><span className="micro-label">Total raised</span><strong className="numeric">{workOrders.length}</strong></div></div>
        {showForm && <form className="panel raise-form" onSubmit={submit}><span className="micro-label">New work order</span><div className="form-grid">
          <label className="field"><span className="field-label">Engine serial number</span><select value={form.esn} onChange={(e) => updateField('esn', e.target.value)} onBlur={() => setTouched({ ...touched, esn: true })}><option value="" disabled>Select an engine</option>{engines.map((engine) => <option key={engine.esn} value={engine.esn}>{engine.esn} — {engine.operator}</option>)}</select>{hasError('esn') && <span className="field-error">Select the engine this work applies to.</span>}</label>
          <label className="field"><span className="field-label">Title</span><input value={form.title} placeholder="e.g. HP turbine borescope rectification" onChange={(e) => updateField('title', e.target.value)} onBlur={() => setTouched({ ...touched, title: true })} />{hasError('title') && <span className="field-error">Give the work order a descriptive title.</span>}</label>
          <label className="field"><span className="field-label">Priority</span><select value={form.priority} onChange={(e) => updateField('priority', e.target.value as WorkOrderPriority)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
          <label className="field"><span className="field-label">Facility</span><select value={form.facility} onChange={(e) => updateField('facility', e.target.value)}>{facilities.map((facility) => <option key={facility}>{facility}</option>)}</select></label>
          <label className="field"><span className="field-label">Due date</span><input type="date" value={form.dueOn} onChange={(e) => updateField('dueOn', e.target.value)} onBlur={() => setTouched({ ...touched, dueOn: true })} />{hasError('dueOn') && <span className="field-error">A due date is required.</span>}</label>
          <label className="field"><span className="field-label">Raised by</span><input value={form.requesterName} onChange={(e) => updateField('requesterName', e.target.value)} onBlur={() => setTouched({ ...touched, requesterName: true })} />{hasError('requesterName') && <span className="field-error">Enter the requester name.</span>}</label>
          <label className="field"><span className="field-label">Contact email</span><input type="email" value={form.requesterEmail} onChange={(e) => updateField('requesterEmail', e.target.value)} onBlur={() => setTouched({ ...touched, requesterEmail: true })} />{hasError('requesterEmail') && <span className="field-error">Enter a valid contact email.</span>}</label>
        </div><label className="field wide"><span className="field-label">Findings</span><textarea rows={3} value={form.findings} placeholder="Borescope, downlink or line findings supporting this work order" onChange={(e) => updateField('findings', e.target.value)} onBlur={() => setTouched({ ...touched, findings: true })} />{hasError('findings') && <span className="field-error">Record the supporting findings.</span>}</label><label className="field wide"><span className="field-label">Requested tasks (one per line)</span><textarea rows={4} value={form.requestedTasks} placeholder="Remove and replace HPT stage 1 nozzle guide vanes" onChange={(e) => updateField('requestedTasks', e.target.value)} onBlur={() => setTouched({ ...touched, requestedTasks: true })} />{hasError('requestedTasks') && <span className="field-error">List at least one task.</span>}</label><div className="form-actions"><button className="rr-button rr-button-flat pill-cta" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Raising…' : 'Raise work order'}</button></div></form>}
        <div className="filter-bar panel"><div className="search-field"><Icon>search</Icon><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by work order, ESN, operator or title" /></div><div className="chip-row">{statuses.map((status) => <button key={status} className={`chip${status === selectedStatus ? ' selected' : ''}`} onClick={() => setSelectedStatus(status)}>{status}</button>)}</div></div>
        <div className="order-list">{filteredWorkOrders.map((order) => <article className="panel order-card" key={order.id}><header className="order-head" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}><div className="order-identity"><span className="micro-label">{order.id}</span><h2>{order.title}</h2><span className="order-sub">{order.esn} · {order.operator} · {order.facility}</span></div><div className="order-meta"><span className={`status-pill ${priorityClass(order.priority)}`}>{order.priority}</span><span className={`status-pill ${statusClass(order.status)}`}>{order.status}</span><span className="due">Due {order.dueOn}</span><Icon>{expandedId === order.id ? 'expand_less' : 'expand_more'}</Icon></div></header><div className="order-progress"><div className="progress-track"><div className="progress-fill" style={{ width: `${taskProgress(order)}%` }} /></div><span className="progress-value numeric">{taskProgress(order)}% tasks complete</span></div>{expandedId === order.id && <div className="order-detail"><div className="detail-facts"><div><span className="micro-label">Raised by</span><strong>{order.raisedBy}</strong></div><div><span className="micro-label">Raised on</span><strong>{formatDate(order.raisedOn, 'dd MMM yyyy')}</strong></div><div><span className="micro-label">Labour booked</span><strong className="numeric">{engineHours(order.labourHours)}</strong></div></div><table className="rr-table"><thead><tr><th>Task card</th><th>Description</th><th>State</th></tr></thead><tbody>{order.tasks.map((task) => <tr key={task.reference}><td>{task.reference}</td><td>{task.description}</td><td><span className={`status-pill ${task.complete ? 'state-nominal' : 'state-no-data'}`}>{task.complete ? 'Complete' : 'Open'}</span></td></tr>)}{order.tasks.length === 0 && <tr><td colSpan={3} className="empty-cell">No task cards issued yet.</td></tr>}</tbody></table></div>}</article>)}{filteredWorkOrders.length === 0 && <div className="panel empty-state"><Icon>inbox</Icon><p>No work orders match the current filters.</p></div>}</div>
      </div>}
    </>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../shared/components/Icon';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useAuth } from '../shared/auth/useAuth';
import { getAlerts, getEngines, getFleetStats } from '../shared/data/fleetService';
import { formatDate } from '../shared/lib/date';
import { stateClass } from '../shared/lib/format';
import { useAsync } from '../shared/lib/useAsync';
import { Engine, EngineState } from '../shared/models/engine';
import './dashboard.scss';

const marginBarWidth = (engine: Engine): number =>
  Math.min(100, Math.round((engine.egtMargin / 60) * 100));

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { data, isLoading } = useAsync(
    () => Promise.all([getFleetStats(), getEngines(), getAlerts()]),
    []
  );

  const [stats, engines, alerts] = data ?? [undefined, [], []];

  const attentionEngines = useMemo(
    () =>
      engines
        .filter(
          engine => engine.state === EngineState.ActNow || engine.state === EngineState.Watchlist
        )
        .sort((a, b) => a.egtMargin - b.egtMargin),
    [engines]
  );

  if (isLoading || !stats) {
    return <LoadingSpinner isLoading message="Loading fleet health…" />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="micro-label">Fleet dashboard</span>
          <h1>Good morning, {currentUser?.firstName}</h1>
          <p>Managed engine status as of the last EHM downlink.</p>
        </div>
        <div className="header-actions">
          <Link className="rr-button stroked pill-cta" to="/health-trending">
            <Icon name="show_chart" /> Health trending
          </Link>
          <Link className="rr-button primary pill-cta" to="/work-orders">
            <Icon name="add" /> Raise work order
          </Link>
        </div>
      </div>

      <section className="stat-grid">
        <div className="panel stat-card">
          <span className="micro-label">Engines managed</span>
          <strong className="numeric">{stats.enginesManaged}</strong>
          <span className="stat-note">
            {stats.onWing} on wing · {stats.inShopVisit} in shop visit
          </span>
        </div>
        <div className="panel stat-card">
          <span className="micro-label">Act now</span>
          <strong className="numeric act-now">{stats.actNow}</strong>
          <span className="stat-note">{stats.watchlist} further engines on the watchlist</span>
        </div>
        <div className="panel stat-card">
          <span className="micro-label">Fleet availability</span>
          <strong className="numeric">{stats.availabilityPct}%</strong>
          <span className="stat-note">Contracted floor is 92.0%</span>
        </div>
        <div className="panel stat-card">
          <span className="micro-label">Mean EGT margin</span>
          <strong className="numeric">{stats.meanEgtMargin} degC</strong>
          <span className="stat-note">{stats.aogOpen} AOG work order open</span>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-flush">
          <header className="panel-head">
            <div>
              <span className="micro-label">Engines needing attention</span>
              <h2>Ranked by remaining EGT margin</h2>
            </div>
            <Link to="/engine-explorer">Open engine explorer</Link>
          </header>
          <table className="rr-table">
            <thead>
              <tr>
                <th>Engine</th>
                <th>Operator</th>
                <th>State</th>
                <th>EGT margin</th>
                <th>Cycles to shop visit</th>
              </tr>
            </thead>
            <tbody>
              {attentionEngines.map(engine => (
                <tr key={engine.esn}>
                  <td>
                    <strong>{engine.esn}</strong>
                    <span className="cell-sub">
                      {engine.family} · {engine.tailNumber}
                    </span>
                  </td>
                  <td>{engine.operator}</td>
                  <td>
                    <span className={`status-pill ${stateClass(engine.state)}`}>{engine.state}</span>
                  </td>
                  <td>
                    <div className="margin-cell">
                      <span className="numeric">{engine.egtMargin} degC</span>
                      <div className="margin-bar">
                        <span
                          className={stateClass(engine.state)}
                          style={{ width: `${marginBarWidth(engine)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="numeric">{engine.cyclesToShopVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel alerts-panel">
          <span className="micro-label">Open alerts</span>
          <h2>Signals raised in the last 10 days</h2>
          {alerts.map(alert => (
            <article className="alert-item" key={alert.id}>
              <div className="alert-head">
                <span className={`status-pill ${stateClass(alert.state)}`}>{alert.signal}</span>
                <span className="alert-time">{formatDate(alert.detected, 'dd MMM HH:mm')}</span>
              </div>
              <strong>
                {alert.esn} · {alert.operator}
              </strong>
              <p>{alert.summary}</p>
              <p className="alert-action">
                <Icon name="arrow_forward" />
                {alert.recommendedAction}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <Link className="panel action-card" to="/shop-visit-planner">
          <Icon name="build_circle" />
          <div>
            <strong>Plan a shop visit</strong>
            <span>Price a workscope and see the turnaround impact.</span>
          </div>
        </Link>
        <Link className="panel action-card" to="/health-trending">
          <Icon name="show_chart" />
          <div>
            <strong>Review a trend</strong>
            <span>Twelve months of margin, vibration and oil signals.</span>
          </div>
        </Link>
        <Link className="panel action-card" to="/work-orders">
          <Icon name="assignment" />
          <div>
            <strong>Track execution</strong>
            <span>Work orders across line stations and overhaul bases.</span>
          </div>
        </Link>
      </section>
    </div>
  );
}

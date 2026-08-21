import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fleetService } from '../shared/data/fleetService';
import { useAsync } from '../shared/lib/async';
import { engineHours, stateClass } from '../shared/lib/format';
import { formatDate } from '../shared/lib/date';
import { EngineFamily, EngineLocation, EngineState } from '../shared/models/engine';
import { Icon } from '../shared/components/Icon';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import './engine-explorer.scss';

type EngineFilter = EngineState | 'All';
type FamilyFilter = EngineFamily | 'All';

const states: EngineFilter[] = [
  'All',
  EngineState.ActNow,
  EngineState.Watchlist,
  EngineState.Nominal,
  EngineState.NoData
];

const families: FamilyFilter[] = [
  'All',
  EngineFamily.Trent1000,
  EngineFamily.TrentXWB,
  EngineFamily.Trent7000,
  EngineFamily.Trent900,
  EngineFamily.BR725
];

export default function EngineExplorerPage() {
  const { data, isLoading } = useAsync(() => fleetService.getEngines(), []);
  const engines = data ?? [];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<EngineFilter>('All');
  const [selectedFamily, setSelectedFamily] = useState<FamilyFilter>('All');
  const [expandedEsn, setExpandedEsn] = useState<string | null>(null);
  const term = searchTerm.trim().toLowerCase();

  const filteredEngines = engines.filter((engine) => {
    const matchesState = selectedState === 'All' || engine.state === selectedState;
    const matchesFamily = selectedFamily === 'All' || engine.family === selectedFamily;
    const matchesTerm =
      term.length === 0 ||
      engine.esn.toLowerCase().indexOf(term) > -1 ||
      engine.operator.toLowerCase().indexOf(term) > -1 ||
      engine.tailNumber.toLowerCase().indexOf(term) > -1 ||
      engine.hub.toLowerCase().indexOf(term) > -1;
    return matchesState && matchesFamily && matchesTerm;
  });

  const locationIcon = (location: EngineLocation): string => {
    switch (location) {
      case EngineLocation.OnWing: return 'flight';
      case EngineLocation.ShopVisit: return 'build_circle';
      case EngineLocation.Spare: return 'inventory_2';
      default: return 'report_problem';
    }
  };

  const moduleUsagePct = (cyclesSinceOverhaul: number, limitCycles: number): number =>
    Math.min(100, Math.round((cyclesSinceOverhaul / limitCycles) * 100));

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('All');
    setSelectedFamily('All');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Engine explorer</span>
          <h1>Managed engine register</h1>
          <p>Search the fleet, then open an engine for module condition detail.</p>
        </div>
        <button className="rr-button rr-button-stroked pill-cta" onClick={clearFilters}>
          <Icon>filter_alt_off</Icon> Clear filters
        </button>
      </div>

      <section className="panel filter-bar">
        <div className="search-field">
          <Icon>search</Icon>
          <input
            type="text"
            name="searchTerm"
            placeholder="ESN, operator, tail number or hub"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <span className="micro-label">State</span>
          <div className="chip-row">
            {states.map((state) => (
              <button key={state} className={`chip${selectedState === state ? ' selected' : ''}`} onClick={() => setSelectedState(state)}>
                {state}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="micro-label">Family</span>
          <div className="chip-row">
            {families.map((family) => (
              <button key={family} className={`chip${selectedFamily === family ? ' selected' : ''}`} onClick={() => setSelectedFamily(family)}>
                {family}
              </button>
            ))}
          </div>
        </div>
      </section>

      <LoadingSpinner isLoading={isLoading} message="Loading engine register…" />
      {!isLoading && (
        <>
          <p className="result-count">{filteredEngines.length} of {engines.length} engines</p>
          <section className="engine-list">
            {filteredEngines.map((engine) => (
              <article className="panel engine-card" key={engine.esn}>
                <header className="engine-head" onClick={() => setExpandedEsn(expandedEsn === engine.esn ? null : engine.esn)}>
                  <div className="engine-identity">
                    <Icon className="location-icon">{locationIcon(engine.location)}</Icon>
                    <div>
                      <strong>{engine.esn}</strong>
                      <span className="engine-sub">{engine.family} · {engine.operator} · {engine.tailNumber}</span>
                    </div>
                  </div>
                  <div className="engine-metrics">
                    <div className="metric">
                      <span className="micro-label">EGT margin</span>
                      <strong className="numeric">{engine.egtMargin} degC</strong>
                    </div>
                    <div className="metric">
                      <span className="micro-label">Vibration</span>
                      <strong className="numeric">{engine.vibrationIps} ips</strong>
                    </div>
                    <div className="metric">
                      <span className="micro-label">Cycles to SV</span>
                      <strong className="numeric">{engine.cyclesToShopVisit}</strong>
                    </div>
                    <span className={`status-pill ${stateClass(engine.state)}`}>{engine.state}</span>
                    <Icon className="chevron">{expandedEsn === engine.esn ? 'expand_less' : 'expand_more'}</Icon>
                  </div>
                </header>

                {expandedEsn === engine.esn && (
                  <div className="engine-detail">
                    <div className="detail-facts">
                      <div><span className="micro-label">Location</span><p>{engine.location} · {engine.hub}</p></div>
                      <div><span className="micro-label">Flight hours</span><p className="numeric">{engineHours(engine.flightHours)}</p></div>
                      <div><span className="micro-label">Flight cycles</span><p className="numeric">{engineHours(engine.flightCycles, 'cycles')}</p></div>
                      <div><span className="micro-label">Oil consumption</span><p className="numeric">{engine.oilConsumptionLph} l/hr</p></div>
                      <div><span className="micro-label">Last flight</span><p>{formatDate(engine.lastFlight, 'dd MMM yyyy HH:mm')}</p></div>
                    </div>
                    <h3>Module condition</h3>
                    <table className="rr-table">
                      <thead><tr><th>Module</th><th>State</th><th>Cycles since overhaul</th><th>Life used</th><th>Engineering note</th></tr></thead>
                      <tbody>
                        {engine.modules.map((module) => (
                          <tr key={module.module}>
                            <td>{module.module}</td>
                            <td><span className={`status-pill ${stateClass(module.state)}`}>{module.state}</span></td>
                            <td className="numeric">{module.cyclesSinceOverhaul} / {module.limitCycles}</td>
                            <td><div className="usage-bar"><span style={{ width: `${moduleUsagePct(module.cyclesSinceOverhaul, module.limitCycles)}%` }} className={stateClass(module.state)} /></div></td>
                            <td className="note-cell">{module.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="detail-actions">
                      <Link className="rr-button rr-button-stroked pill-cta" to="/health-trending">View trend</Link>
                      <Link className="rr-button rr-button-flat pill-cta" to="/shop-visit-planner">Plan shop visit</Link>
                    </div>
                  </div>
                )}
              </article>
            ))}
            {filteredEngines.length === 0 && <p className="empty-state">No engines match the current filters.</p>}
          </section>
        </>
      )}
    </>
  );
}

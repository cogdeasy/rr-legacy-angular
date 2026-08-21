import { useEffect, useState } from 'react';
import { Icon } from '../shared/components/Icon';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { estimateShopVisit, getEngines, getWorkscopeOptions } from '../shared/data/fleetService';
import { currencyFormat } from '../shared/lib/format';
import { useAsync } from '../shared/lib/useAsync';
import './shop-visit-planner.scss';

interface Facility {
  name: string;
  factor: number;
  note: string;
}

interface DonutSegment {
  label: string;
  dashArray: string;
  dashOffset: number;
  colour: string;
  share: number;
}

const DONUT_CIRCUMFERENCE = 2 * Math.PI * 60;
const SEGMENT_COLOURS = [
  'var(--rr-series-1)',
  'var(--rr-series-2)',
  'var(--rr-series-3)',
  'var(--rr-series-4)',
  'var(--rr-series-5)'
];

const facilities: Facility[] = [
  { name: 'Derby', factor: 1, note: 'Home base, full module capability.' },
  { name: 'Dahlewitz', factor: 1.08, note: 'Specialist HP turbine cell, higher labour rate.' },
  { name: 'Singapore', factor: 0.94, note: 'Lower labour rate, longer parts lead time.' },
  { name: 'Dallas partner shop', factor: 1.16, note: 'Overflow capacity only.' }
];

export default function ShopVisitPlannerPage() {
  const { data: engines, isLoading } = useAsync(getEngines, []);
  const workscopeOptions = getWorkscopeOptions();

  const [selectedCodes, setSelectedCodes] = useState<string[]>(['WS-HPT', 'WS-TEST']);
  const [selectedEsn, setSelectedEsn] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility>(facilities[0]);

  useEffect(() => {
    if (engines && engines.length > 0 && selectedEsn === '') {
      setSelectedEsn(engines[0].esn);
    }
  }, [engines, selectedEsn]);

  const selectedEngine = (engines ?? []).find(engine => engine.esn === selectedEsn);
  const estimate = estimateShopVisit(selectedCodes, selectedFacility.factor);
  const projectedMargin = selectedEngine
    ? selectedEngine.egtMargin + estimate.restoredEgtMargin
    : estimate.restoredEgtMargin;

  let consumed = 0;
  const donutSegments: DonutSegment[] = estimate.breakdown.map((line, index) => {
    const length = (line.share / 100) * DONUT_CIRCUMFERENCE;
    const segment: DonutSegment = {
      label: line.label,
      dashArray: `${length} ${DONUT_CIRCUMFERENCE - length}`,
      dashOffset: -consumed,
      colour: SEGMENT_COLOURS[index % SEGMENT_COLOURS.length],
      share: line.share
    };
    consumed += length;
    return segment;
  });

  const isSelected = (code: string) => selectedCodes.indexOf(code) > -1;

  const toggleWorkscope = (code: string) =>
    setSelectedCodes(current =>
      current.indexOf(code) > -1 ? current.filter(selected => selected !== code) : [...current, code]
    );

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Shop visit planner</span>
          <h1>Workscope and turnaround estimate</h1>
          <p>Build a workscope, pick a facility, and see the cost, downtime and margin recovered.</p>
        </div>
        <button type="button" className="rr-button stroked pill-cta" onClick={() => setSelectedCodes([])}>
          <Icon name="restart_alt" /> Reset workscope
        </button>
      </div>

      <LoadingSpinner isLoading={isLoading} message="Loading planner inputs…" />

      {!isLoading && (
        <div className="planner-layout">
          <section className="planner-inputs">
            <div className="panel">
              <span className="micro-label">Engine</span>
              <select
                className="select-input"
                value={selectedEsn}
                onChange={event => setSelectedEsn(event.target.value)}
              >
                {(engines ?? []).map(engine => (
                  <option value={engine.esn} key={engine.esn}>
                    {engine.esn} — {engine.family} ({engine.operator})
                  </option>
                ))}
              </select>

              {selectedEngine && (
                <div className="engine-facts">
                  <div>
                    <span className="micro-label">Current EGT margin</span>
                    <strong className="numeric">{selectedEngine.egtMargin} degC</strong>
                  </div>
                  <div>
                    <span className="micro-label">Cycles to shop visit</span>
                    <strong className="numeric">{selectedEngine.cyclesToShopVisit}</strong>
                  </div>
                  <div>
                    <span className="micro-label">Location</span>
                    <strong>{selectedEngine.location}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="panel">
              <span className="micro-label">Workscope</span>
              {workscopeOptions.map(option => (
                <label className="workscope-option" key={option.code}>
                  <input
                    type="checkbox"
                    checked={isSelected(option.code)}
                    onChange={() => toggleWorkscope(option.code)}
                  />
                  <span className="option-body">
                    <strong>{option.label}</strong>
                    <span className="option-note">{option.description}</span>
                    <span className="option-meta numeric">
                      {option.labourHours} labour hrs · {currencyFormat(option.materialCost)} materials
                      · {option.turnaroundDays} days
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="panel">
              <span className="micro-label">Facility</span>
              <div className="facility-row">
                {facilities.map(facility => (
                  <button
                    type="button"
                    key={facility.name}
                    className={
                      facility.name === selectedFacility.name ? 'facility-chip selected' : 'facility-chip'
                    }
                    onClick={() => setSelectedFacility(facility)}
                  >
                    {facility.name}
                  </button>
                ))}
              </div>
              <p className="facility-note">{selectedFacility.note}</p>
            </div>
          </section>

          <section className="planner-output">
            <div className="panel estimate-panel">
              <span className="micro-label">Estimate</span>
              <h2 className="numeric">{currencyFormat(estimate.totalCost)}</h2>
              <p className="estimate-sub">
                {estimate.turnaroundDays} days turnaround · {estimate.labourHours} labour hours
              </p>

              <div className="estimate-grid">
                <div>
                  <span className="micro-label">Labour</span>
                  <strong className="numeric">{currencyFormat(estimate.labourCost)}</strong>
                </div>
                <div>
                  <span className="micro-label">Materials</span>
                  <strong className="numeric">{currencyFormat(estimate.materialCost)}</strong>
                </div>
                <div>
                  <span className="micro-label">Margin recovered</span>
                  <strong className="numeric">+{estimate.restoredEgtMargin} degC</strong>
                </div>
                <div>
                  <span className="micro-label">Cycles restored</span>
                  <strong className="numeric">{estimate.cyclesRestored}</strong>
                </div>
              </div>

              {selectedEngine && (
                <p className="projection">
                  <Icon name="trending_up" />
                  {selectedEngine.esn} would return to service at{' '}
                  <strong className="numeric">{projectedMargin} degC</strong> margin.
                </p>
              )}
            </div>

            <div className="panel donut-panel">
              <span className="micro-label">Cost split</span>
              <div className="donut-row">
                <svg viewBox="0 0 160 160" className="donut" role="img" aria-label="Cost split by workscope">
                  <circle className="donut-track" cx="80" cy="80" r="60" />
                  {donutSegments.map(segment => (
                    <circle
                      key={segment.label}
                      className="donut-segment"
                      cx="80"
                      cy="80"
                      r="60"
                      stroke={segment.colour}
                      strokeDasharray={segment.dashArray}
                      strokeDashoffset={segment.dashOffset}
                    />
                  ))}
                </svg>
                <ul className="legend">
                  {donutSegments.map(segment => (
                    <li key={segment.label}>
                      <span className="swatch" style={{ background: segment.colour }} />
                      <span className="legend-label">{segment.label}</span>
                      <span className="legend-share numeric">{segment.share}%</span>
                    </li>
                  ))}
                  {donutSegments.length === 0 && (
                    <li className="legend-empty">Select at least one workscope item.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="panel-flush">
              <table className="rr-table">
                <thead>
                  <tr>
                    <th>Workscope line</th>
                    <th>Cost</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.breakdown.map(line => (
                    <tr key={line.label}>
                      <td>{line.label}</td>
                      <td className="numeric">{currencyFormat(line.cost)}</td>
                      <td className="numeric">{line.share}%</td>
                    </tr>
                  ))}
                  {estimate.breakdown.length === 0 && (
                    <tr>
                      <td colSpan={3} className="empty-cell">
                        No workscope selected.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

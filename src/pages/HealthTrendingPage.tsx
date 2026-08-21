import { useEffect, useState } from 'react';
import { fleetService } from '../shared/data/fleetService';
import { useAsync } from '../shared/lib/async';
import { stateClass } from '../shared/lib/format';
import { EngineTrend } from '../shared/models/engine';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import './health-trending.scss';

interface SignalOption {
  key: 'egtMargin' | 'vibrationIps' | 'oilConsumptionLph';
  label: string;
  unit: string;
  betterWhen: 'higher' | 'lower';
}
interface ChartPoint {
  x: number;
  y: number;
  label: string;
  value: number;
}

const CHART_WIDTH = 720;
const CHART_HEIGHT = 260;
const CHART_PADDING = 32;

const signals: SignalOption[] = [
  { key: 'egtMargin', label: 'EGT margin', unit: 'degC', betterWhen: 'higher' },
  { key: 'vibrationIps', label: 'Broadband vibration', unit: 'ips', betterWhen: 'lower' },
  { key: 'oilConsumptionLph', label: 'Oil consumption', unit: 'l/hr', betterWhen: 'lower' }
];
const EMPTY_ENGINES: never[] = [];

export default function HealthTrendingPage() {
  const enginesLoad = useAsync(() => fleetService.getEngines(), []);
  const engines = enginesLoad.data ?? EMPTY_ENGINES;
  const [selectedEsn, setSelectedEsn] = useState('');
  const [selectedSignal, setSelectedSignal] = useState(signals[0]);
  useEffect(() => {
    if (engines.length > 0 && !selectedEsn) {
      setSelectedEsn(engines[0].esn);
    }
  }, [engines, selectedEsn]);

  const trendLoad = useAsync<EngineTrend | undefined>(
    () => selectedEsn ? fleetService.getTrend(selectedEsn) : Promise.resolve(undefined),
    [selectedEsn]
  );
  const trend = trendLoad.data ?? null;
  const isTrendLoading = Boolean(selectedEsn) && trendLoad.isLoading;
  const selectedEngine = engines.find((engine) => engine.esn === selectedEsn);
  const points = trend?.points ?? [];
  const values = points.map((point) => point[selectedSignal.key]);
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const span = max - min || 1;
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const chartPoints: ChartPoint[] = points.map((point, index) => {
    const value = point[selectedSignal.key];

    return {
      x: CHART_PADDING + (index / (points.length - 1)) * usableWidth,
      y: CHART_PADDING + usableHeight - ((value - min) / span) * usableHeight,
      label: point.date,
      value
    };
  });
  const polyline = chartPoints
    .map((point) => `${point.x},${point.y}`)
    .join(' ');
  const areaPath =
    chartPoints.length === 0
      ? ''
      : `M ${chartPoints[0].x} ${CHART_HEIGHT - CHART_PADDING} ${chartPoints
          .map((point) => `L ${point.x} ${point.y}`)
          .join(' ')} L ${
          chartPoints[chartPoints.length - 1].x
        } ${CHART_HEIGHT - CHART_PADDING} Z`;
  const currentValue =
    points.length > 0 ? points[points.length - 1][selectedSignal.key] : 0;
  const twelveMonthDelta =
    points.length < 2
      ? 0
      : Math.round(
          (points[points.length - 1][selectedSignal.key] -
            points[0][selectedSignal.key]) *
            100
        ) / 100;
  const deltaIsAdverse =
    twelveMonthDelta === 0
      ? false
      : selectedSignal.betterWhen === 'higher'
        ? twelveMonthDelta < 0
        : twelveMonthDelta > 0;
  const peakValue = values.length > 0 ? Math.max(...values) : 0;
  const troughValue = values.length > 0 ? Math.min(...values) : 0;
  const monthOnMonth = (index: number) =>
    index === 0
      ? 0
      : Math.round(
          (points[index][selectedSignal.key] -
            points[index - 1][selectedSignal.key]) *
            100
        ) / 100;

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Health trending</span>
          <h1>Twelve month signal history</h1>
          <p>
            Compare downlinked signals against the family baseline before
            committing a workscope.
          </p>
        </div>
      </div>
      <LoadingSpinner isLoading={enginesLoad.isLoading} message="Loading engine list…" />
      {!enginesLoad.isLoading && (
        <div className="trend-layout">
          <aside className="panel engine-picker">
            <span className="micro-label">Engine</span>
            {engines.map((engine) => (
              <button
                key={engine.esn}
                className={`picker-item${
                  engine.esn === selectedEsn ? ' selected' : ''
                }`}
                onClick={() => setSelectedEsn(engine.esn)}
              >
                <span className="picker-esn">{engine.esn}</span>
                <span className="picker-sub">{engine.family} · {engine.operator}</span>
                <span className={`status-pill ${stateClass(engine.state)}`}>
                  {engine.state}
                </span>
              </button>
            ))}
          </aside>
          <section className="trend-main">
            <div className="signal-tabs">
              {signals.map((signal) => (
                <button
                  key={signal.key}
                  className={`signal-tab${
                    signal.key === selectedSignal.key ? ' selected' : ''
                  }`}
                  onClick={() => setSelectedSignal(signal)}
                >
                  {signal.label}
                </button>
              ))}
            </div>
            <LoadingSpinner isLoading={isTrendLoading} message="Loading trend…" />
            {!isTrendLoading && trend && (
              <div>
                <div className="summary-row">
                  <div className="panel summary-card">
                    <span className="micro-label">Latest</span>
                    <strong className="numeric">
                      {currentValue} {selectedSignal.unit}
                    </strong>
                    <span className="summary-note">
                      {selectedEngine?.esn} · {selectedEngine?.operator}
                    </span>
                  </div>
                  <div className="panel summary-card">
                    <span className="micro-label">12 month change</span>
                    <strong
                      className={`numeric${deltaIsAdverse ? ' adverse' : ''}`}
                    >
                      {twelveMonthDelta > 0 ? '+' : ''}
                      {twelveMonthDelta} {selectedSignal.unit}
                    </strong>
                    <span className="summary-note">
                      {deltaIsAdverse
                        ? 'Moving away from the nominal band'
                        : 'Within expected drift'}
                    </span>
                  </div>
                  <div className="panel summary-card">
                    <span className="micro-label">Range</span>
                    <strong className="numeric">
                      {troughValue} – {peakValue} {selectedSignal.unit}
                    </strong>
                    <span className="summary-note">
                      Rolling minimum and maximum
                    </span>
                  </div>
                </div>
                <div className="panel chart-panel">
                  <header className="chart-head">
                    <div>
                      <span className="micro-label">{selectedSignal.label}</span>
                      <h2>{selectedEsn}</h2>
                    </div>
                    <span className="chart-unit">
                      Values in {selectedSignal.unit}
                    </span>
                  </header>
                  <svg
                    className="trend-chart"
                    viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label="Signal trend chart"
                  >
                    <path className="chart-area" d={areaPath} />
                    <polyline className="chart-line" points={polyline} />
                    {chartPoints.map((point) => (
                      <g key={`${point.x}-${point.y}`}>
                        <circle
                          className="chart-dot"
                          cx={point.x}
                          cy={point.y}
                          r="3.5"
                        />
                        <text
                          className="chart-label"
                          x={point.x}
                          y={CHART_HEIGHT - 8}
                        >
                          {point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div className="panel-flush">
                  <table className="rr-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>EGT margin (degC)</th>
                        <th>Vibration (ips)</th>
                        <th>Oil (l/hr)</th>
                        <th>Change in {selectedSignal.label}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {points.map((point, index) => (
                        <tr key={point.date}>
                          <td>{point.date}</td>
                          <td className="numeric">{point.egtMargin}</td>
                          <td className="numeric">{point.vibrationIps}</td>
                          <td className="numeric">{point.oilConsumptionLph}</td>
                          <td className="numeric">
                            {monthOnMonth(index) > 0 ? '+' : ''}
                            {monthOnMonth(index)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

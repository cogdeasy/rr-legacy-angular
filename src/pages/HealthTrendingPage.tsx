import { useEffect, useMemo, useState } from 'react';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { getEngines, getTrend } from '../shared/data/fleetService';
import { stateClass } from '../shared/lib/format';
import { useAsync } from '../shared/lib/useAsync';
import { EngineTrend, TrendPoint } from '../shared/models/engine';
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

const toChartPoints = (points: TrendPoint[], signal: SignalOption): ChartPoint[] => {
  const values = points.map(point => point[signal.key]);
  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;

  return points.map((point, index) => {
    const value = point[signal.key];
    return {
      x: CHART_PADDING + (index / (points.length - 1)) * usableWidth,
      y: CHART_PADDING + usableHeight - ((value - min) / span) * usableHeight,
      label: point.date,
      value
    };
  });
};

export default function HealthTrendingPage() {
  const { data: engines, isLoading } = useAsync(getEngines, []);
  const [selectedEsn, setSelectedEsn] = useState('');
  const [selectedSignal, setSelectedSignal] = useState<SignalOption>(signals[0]);
  const [trend, setTrend] = useState<EngineTrend | null>(null);
  const [isTrendLoading, setIsTrendLoading] = useState(false);

  useEffect(() => {
    if (engines && engines.length > 0 && selectedEsn === '') {
      setSelectedEsn(engines[0].esn);
    }
  }, [engines, selectedEsn]);

  useEffect(() => {
    if (selectedEsn === '') {
      return;
    }
    let active = true;
    setIsTrendLoading(true);
    getTrend(selectedEsn).then(result => {
      if (!active) {
        return;
      }
      setTrend(result);
      setIsTrendLoading(false);
    });
    return () => {
      active = false;
    };
  }, [selectedEsn]);

  const points = trend ? trend.points : [];
  const selectedEngine = (engines ?? []).find(engine => engine.esn === selectedEsn);
  const chartPoints = useMemo(() => toChartPoints(points, selectedSignal), [points, selectedSignal]);

  const polyline = chartPoints.map(point => `${point.x},${point.y}`).join(' ');

  const areaPath = (() => {
    if (chartPoints.length === 0) {
      return '';
    }
    const baseline = CHART_HEIGHT - CHART_PADDING;
    const line = chartPoints.map(point => `L ${point.x} ${point.y}`).join(' ');
    return `M ${chartPoints[0].x} ${baseline} ${line} L ${
      chartPoints[chartPoints.length - 1].x
    } ${baseline} Z`;
  })();

  const currentValue = points.length > 0 ? points[points.length - 1][selectedSignal.key] : 0;

  const twelveMonthDelta = (() => {
    if (points.length < 2) {
      return 0;
    }
    const delta = points[points.length - 1][selectedSignal.key] - points[0][selectedSignal.key];
    return Math.round(delta * 100) / 100;
  })();

  const deltaIsAdverse =
    twelveMonthDelta !== 0 &&
    (selectedSignal.betterWhen === 'higher' ? twelveMonthDelta < 0 : twelveMonthDelta > 0);

  const values = points.map(point => point[selectedSignal.key]);
  const peakValue = values.length > 0 ? Math.max(...values) : 0;
  const troughValue = values.length > 0 ? Math.min(...values) : 0;

  const monthOnMonth = (index: number): number => {
    if (index === 0) {
      return 0;
    }
    const current = points[index][selectedSignal.key];
    const previous = points[index - 1][selectedSignal.key];
    return Math.round((current - previous) * 100) / 100;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="micro-label">Health trending</span>
          <h1>Twelve month signal history</h1>
          <p>Compare downlinked signals against the family baseline before committing a workscope.</p>
        </div>
      </div>

      <LoadingSpinner isLoading={isLoading} message="Loading engine list…" />

      {!isLoading && (
        <div className="trend-layout">
          <aside className="panel engine-picker">
            <span className="micro-label">Engine</span>
            {(engines ?? []).map(engine => (
              <button
                type="button"
                key={engine.esn}
                className={engine.esn === selectedEsn ? 'picker-item selected' : 'picker-item'}
                onClick={() => setSelectedEsn(engine.esn)}
              >
                <span className="picker-esn">{engine.esn}</span>
                <span className="picker-sub">
                  {engine.family} · {engine.operator}
                </span>
                <span className={`status-pill ${stateClass(engine.state)}`}>{engine.state}</span>
              </button>
            ))}
          </aside>

          <section className="trend-main">
            <div className="signal-tabs">
              {signals.map(signal => (
                <button
                  type="button"
                  key={signal.key}
                  className={signal.key === selectedSignal.key ? 'signal-tab selected' : 'signal-tab'}
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
                    <strong className={deltaIsAdverse ? 'numeric adverse' : 'numeric'}>
                      {twelveMonthDelta > 0 ? '+' : ''}
                      {twelveMonthDelta} {selectedSignal.unit}
                    </strong>
                    <span className="summary-note">
                      {deltaIsAdverse ? 'Moving away from the nominal band' : 'Within expected drift'}
                    </span>
                  </div>
                  <div className="panel summary-card">
                    <span className="micro-label">Range</span>
                    <strong className="numeric">
                      {troughValue} – {peakValue} {selectedSignal.unit}
                    </strong>
                    <span className="summary-note">Rolling minimum and maximum</span>
                  </div>
                </div>

                <div className="panel chart-panel">
                  <header className="chart-head">
                    <div>
                      <span className="micro-label">{selectedSignal.label}</span>
                      <h2>{selectedEsn}</h2>
                    </div>
                    <span className="chart-unit">Values in {selectedSignal.unit}</span>
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
                    {chartPoints.map(point => (
                      <g key={point.label}>
                        <circle className="chart-dot" cx={point.x} cy={point.y} r={3.5} />
                        <text className="chart-label" x={point.x} y={CHART_HEIGHT - 8}>
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

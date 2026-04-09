/**
 * BurndownChart — plain SVG line chart, no external charting library.
 * Draws two lines: actual remaining points and the ideal linear trend.
 */
import type { BurndownPoint } from '../../types/sprint';

interface Props {
  points: BurndownPoint[];
}

const WIDTH  = 500;
const HEIGHT = 200;
const PAD    = { top: 16, right: 16, bottom: 32, left: 40 };

export default function BurndownChart({ points }: Props) {
  if (points.length < 2) {
    return (
      <div className="burndown-chart">
        <p className="burndown-chart__title">Burndown Chart</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Not enough data yet.</p>
      </div>
    );
  }

  const maxY = Math.max(...points.map(p => Math.max(p.remaining, p.ideal))) * 1.1;
  const chartW = WIDTH  - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top  - PAD.bottom;

  const xScale = (i: number) => PAD.left + (i / (points.length - 1)) * chartW;
  const yScale = (v: number) => PAD.top  + chartH - (v / maxY) * chartH;

  const toPath = (getter: (p: BurndownPoint) => number) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(getter(p))}`).join(' ');

  // Y axis tick count
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(r => Math.round(r * maxY));

  return (
    <div className="burndown-chart">
      <p className="burndown-chart__title">Burndown Chart</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="burndown-chart__svg"
        aria-label="Sprint burndown chart"
      >
        {/* Grid lines + Y labels */}
        {ticks.map(tick => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={y} x2={WIDTH - PAD.right} y2={y} className="burndown-chart__grid-line" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="var(--text-muted)">{tick}</text>
            </g>
          );
        })}

        {/* X axis date labels (first and last) */}
        <text x={PAD.left} y={HEIGHT - 6} fontSize={10} fill="var(--text-muted)">{points[0].date.slice(5)}</text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" fontSize={10} fill="var(--text-muted)">
          {points[points.length - 1].date.slice(5)}
        </text>

        {/* Ideal line */}
        <path d={toPath(p => p.ideal)} className="burndown-chart__ideal" />

        {/* Actual line */}
        <path d={toPath(p => p.remaining)} className="burndown-chart__actual" />

        {/* Dots on actual line */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(p.remaining)}
            r={3}
            className="burndown-chart__dot"
          />
        ))}
      </svg>

      <div className="burndown-chart__legend">
        <div className="burndown-chart__legend-item">
          <div className="burndown-chart__legend-line" style={{ background: 'var(--primary)' }} />
          Actual
        </div>
        <div className="burndown-chart__legend-item">
          <div className="burndown-chart__legend-line" style={{ background: 'var(--text-muted)', opacity: 0.6 }} />
          Ideal
        </div>
      </div>
    </div>
  );
}

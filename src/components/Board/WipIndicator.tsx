/** WipIndicator — progress bar showing column issue count vs WIP limit */
interface Props {
  count: number;
  limit: number;
}

export default function WipIndicator({ count, limit }: Props) {
  const ratio  = limit > 0 ? count / limit : 0;
  const status = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : 'ok';
  const pct    = Math.min(ratio * 100, 100);

  return (
    <div className={`wip-indicator wip-indicator--${status}`} title={`${count} of ${limit} WIP limit`}>
      <div className="wip-indicator__bar">
        <div className="wip-indicator__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="wip-indicator__label">{count}/{limit}</span>
    </div>
  );
}

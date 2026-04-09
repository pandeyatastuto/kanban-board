/** SprintHeader — shows sprint name, goal, point progress and days remaining */
import type { Sprint } from '../../types/sprint';

interface Props {
  sprint:      Sprint;
  onComplete:  () => void;
}

function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function SprintHeader({ sprint, onComplete }: Props) {
  const donePoints  = sprint.issues.filter(i => i.status === 'done').reduce((s, i) => s + (i.story_points ?? 0), 0);
  const totalPoints = sprint.issues.reduce((s, i) => s + (i.story_points ?? 0), 0);
  const pct         = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const days        = daysRemaining(sprint.end_date);

  return (
    <div className="sprint-header">
      <div>
        <div className="sprint-header__name">{sprint.name}</div>
        {sprint.goal && <div className="sprint-header__goal">{sprint.goal}</div>}
      </div>

      <div className="sprint-header__stats">
        <div className="sprint-stat">
          <span className="sprint-stat__value">{donePoints}/{totalPoints}</span>
          <span className="sprint-stat__label">Points done</span>
        </div>
        <div className="sprint-stat">
          <span className="sprint-stat__value">{days}</span>
          <span className="sprint-stat__label">Days left</span>
        </div>
        <div className="sprint-stat">
          <span className="sprint-stat__value">{sprint.issues.length}</span>
          <span className="sprint-stat__label">Issues</span>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 200 }}>
        <div className="sprint-progress">
          <div className="sprint-progress__bar">
            <div className="sprint-progress__fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="sprint-progress__label">
            <span>{pct}% complete</span>
            <span>{new Date(sprint.end_date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <button className="btn btn--secondary btn--sm" onClick={onComplete}>
        Complete Sprint
      </button>
    </div>
  );
}

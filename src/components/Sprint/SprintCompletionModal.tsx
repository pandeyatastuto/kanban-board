/**
 * SprintCompletionModal — lets the user select which unfinished issues
 * to carry over to the next sprint before completing the current one.
 */
import { useState } from 'react';
import type { Sprint } from '../../types/sprint';
import type { Issue }  from '../../types/issue';
import { useSprint }  from '../../context/SprintContext';
import Modal          from '../common/Modal';
import { TypeBadge }  from '../common/Badge';

interface Props {
  sprint:  Sprint;
  onClose: () => void;
}

export default function SprintCompletionModal({ sprint, onClose }: Props) {
  const { state, finishSprint } = useSprint();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading,  setLoading]  = useState(false);

  // Issues in this sprint that are not done
  const unfinished: Issue[] = state.sprints
    .find(s => s.sprint_id === sprint.sprint_id)
    ?.issues.filter(i => i.status !== 'done') ?? [];

  const nextSprint = state.sprints.find(s => s.status === 'planning') ?? null;

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    await finishSprint(sprint.sprint_id, [...selected], nextSprint?.sprint_id ?? null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Complete ${sprint.name}`}
      size="md"
      footer={
        <>
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleComplete} disabled={loading}>
            {loading ? 'Completing…' : 'Complete Sprint'}
          </button>
        </>
      }
    >
      {unfinished.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>All issues are done. Ready to complete!</p>
      ) : (
        <>
          <p style={{ marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
            {unfinished.length} issue{unfinished.length !== 1 ? 's' : ''} not done.
            Select any to carry over to {nextSprint?.name ?? 'backlog'}.
          </p>
          {unfinished.map(issue => (
            <label key={issue.issue_id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selected.has(issue.issue_id)}
                onChange={() => toggle(issue.issue_id)}
              />
              <TypeBadge type={issue.type} />
              <span style={{ flex: 1 }}>{issue.title}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{issue.issue_id}</span>
            </label>
          ))}
        </>
      )}
    </Modal>
  );
}

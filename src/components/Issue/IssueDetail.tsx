/**
 * IssueDetail — slide-in panel showing full issue details.
 * Title is inline-editable. Status changes via dropdown.
 * Comments and activity timeline are rendered here.
 */
import { useState, useEffect } from 'react';
import { createPortal }        from 'react-dom';
import type { Issue } from '../../types/issue';
import type { User }               from '../../types/user';
import { useBoard }               from '../../context/BoardContext';
import { getUsers }               from '../../api/userApi';
import InlineEdit                 from './InlineEdit';
import ActivityTimeline           from './ActivityTimeline';
import CommentSection             from './CommentSection';
import Avatar                     from '../common/Avatar';
import { PriorityBadge, TypeBadge, StatusBadge } from '../common/Badge';
import Dropdown                   from '../common/Dropdown';

export default function IssueDetail() {
  const { state, selectIssue, dispatchUpdate, dispatchDelete } = useBoard();
  const [users, setUsers] = useState<User[]>([]);

  // Derived from the API response — works with any column set
  const statusOptions = state.columns.map(col => ({
    value:  col.status,
    label:  col.display_name,
  }));

  useEffect(() => { getUsers().then(setUsers); }, []);

  // Resolve which issue is selected (ignore __new__ prefixed ones — those are handled by IssueModal)
  const issueId = state.selectedIssueId && !state.selectedIssueId.startsWith('__new__')
    ? state.selectedIssueId
    : null;

  const issue: Issue | undefined = issueId
    ? state.columns.flatMap(c => c.issues).find(i => i.issue_id === issueId)
    : undefined;

  if (!issue) return null;

  const close = () => selectIssue(null);

  const updateField = <K extends keyof Issue>(key: K, value: Issue[K]) => {
    dispatchUpdate(issue.issue_id, { [key]: value });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete ${issue.issue_id}? This cannot be undone.`)) {
      dispatchDelete(issue.issue_id);
      close();
    }
  };

  return createPortal(
    <>
      <div className="issue-detail-overlay" onClick={close} />
      <aside className="issue-detail" aria-label="Issue detail">
        {/* Header */}
        <div className="issue-detail__header">
          <TypeBadge type={issue.type} />
          <span className="issue-detail__id">{issue.issue_id}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn--ghost btn--sm" onClick={handleDelete} title="Delete issue">🗑</button>
            <button className="issue-detail__close btn btn--ghost" onClick={close} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="issue-detail__body">
          {/* Editable title */}
          <InlineEdit
            value={issue.title}
            onSave={title => updateField('title', title)}
            placeholder="Issue title"
            className="issue-detail__title"
            multiline={false}
          />

          {/* Status via dropdown */}
          <div className="field-row">
            <span className="field-row__label">Status</span>
            <Dropdown
              trigger={<StatusBadge status={issue.status} />}
              items={statusOptions.map(o => ({
                value:  o.value,
                label:  o.label,
                active: o.value === issue.status,
              }))}
              onSelect={v => updateField('status', v)}
            />
          </div>

          {/* Priority */}
          <div className="field-row">
            <span className="field-row__label">Priority</span>
            <PriorityBadge priority={issue.priority} />
          </div>

          {/* Assignee picker */}
          <div className="field-row">
            <span className="field-row__label">Assignee</span>
            <Dropdown
              trigger={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <Avatar user={issue.assignee} size="sm" />
                  <span style={{ fontSize: 'var(--text-sm)' }}>{issue.assignee?.display_name ?? 'Unassigned'}</span>
                </div>
              }
              items={[
                { value: '__none__', label: 'Unassigned' },
                ...users.map(u => ({
                  value:  u.user_id,
                  label:  u.display_name,
                  active: issue.assignee?.user_id === u.user_id,
                })),
              ]}
              onSelect={v => {
                if (v === '__none__') { updateField('assignee', null); return; }
                const u = users.find(usr => usr.user_id === v);
                if (u) updateField('assignee', { user_id: u.user_id, display_name: u.display_name, avatar_url: u.avatar_url });
              }}
            />
          </div>

          {/* Story points */}
          <div className="field-row">
            <span className="field-row__label">Points</span>
            <InlineEdit
              value={String(issue.story_points ?? '')}
              onSave={v => updateField('story_points', v ? Number(v) : null)}
              placeholder="–"
            />
          </div>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="field-row">
              <span className="field-row__label">Labels</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {issue.labels.map(l => (
                  <span key={l.id} className="label-pill" style={{ background: `${l.color}22`, color: l.color }}>
                    <span className="label-pill__dot" style={{ background: l.color }} />
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Editable description */}
          <div className="form-group" style={{ marginTop: 'var(--space-3)' }}>
            <label className="form-label">Description</label>
            <InlineEdit
              value={issue.description}
              onSave={v => updateField('description', v)}
              multiline
              placeholder="Add a description…"
            />
          </div>

          {/* Comments */}
          <CommentSection
            issueId={issue.issue_id}
            comments={issue.comments}
            users={users}
            onUpdate={comments => updateField('comments', comments)}
          />

          {/* Activity */}
          <ActivityTimeline entries={issue.activity} />
        </div>
      </aside>
    </>,
    document.body
  );
}

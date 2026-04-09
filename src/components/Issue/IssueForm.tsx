/**
 * IssueForm — shared form used by both IssueModal (create) and IssueDetail (edit).
 * Title is required; all other fields are optional.
 */
import { useState, useEffect } from 'react';
import type { Issue, IssueType, IssuePriority, Label } from '../../types/issue';
import type { User } from '../../types/user';
import { getUsers } from '../../api/userApi';
import { getLabels } from '../../api/labelApi';
import { useBoard } from '../../context/BoardContext';
import Avatar from '../common/Avatar';

type IssueFormData = Pick<Issue,
  'title' | 'description' | 'type' | 'priority' | 'status' |
  'assignee' | 'story_points' | 'labels' | 'epic'
>;

interface Props {
  initial?:  Partial<IssueFormData>;
  onSubmit:  (data: IssueFormData) => void;
  submitLabel?: string;
}

const TYPES:      IssueType[]     = ['task', 'bug', 'story', 'epic', 'subtask'];
const PRIORITIES: IssuePriority[] = ['critical', 'high', 'medium', 'low'];

export default function IssueForm({ initial = {}, onSubmit, submitLabel = 'Create' }: Props) {
  const { state } = useBoard();

  // Derived from the API — works with any column set returned by the server
  const statuses = state.columns.map(col => ({ value: col.status, label: col.display_name }));
  const defaultStatus = state.columns[0]?.status ?? '';

  const DEFAULT: IssueFormData = {
    title:        '',
    description:  '',
    type:         'task',
    priority:     'medium',
    status:       defaultStatus,
    assignee:     null,
    story_points: null,
    labels:       [],
    epic:         null,
  };

  const [form,   setForm]   = useState<IssueFormData>({ ...DEFAULT, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof IssueFormData, string>>>({});
  const [users,  setUsers]  = useState<User[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
    getLabels().then(setLabels);
  }, []);

  const set = <K extends keyof IssueFormData>(key: K, value: IssueFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: typeof errors = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const toggleLabel = (label: Label) => {
    const has = form.labels.some(l => l.id === label.id);
    set('labels', has ? form.labels.filter(l => l.id !== label.id) : [...form.labels, label]);
  };

  return (
    <form className="issue-form" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="form-group">
        <label className="form-label form-label--required">Title</label>
        <input
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          placeholder="Short, descriptive title"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          autoFocus
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          placeholder="Add more detail…"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
        />
      </div>

      {/* Type + Priority on the same row */}
      <div className="issue-form__row">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => set('type', e.target.value as IssueType)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value as IssuePriority)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Status + Story points */}
      <div className="issue-form__row">
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Story points</label>
          <input
            className="form-input"
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 3"
            value={form.story_points ?? ''}
            onChange={e => set('story_points', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      {/* Assignee */}
      <div className="form-group">
        <label className="form-label">Assignee</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className={`btn btn--secondary btn--sm ${!form.assignee ? 'btn--primary' : ''}`}
            onClick={() => set('assignee', null)}
          >
            Unassigned
          </button>
          {users.map(u => (
            <button
              key={u.user_id}
              type="button"
              className={`btn btn--secondary btn--sm`}
              style={form.assignee?.user_id === u.user_id ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
              onClick={() => set('assignee', { user_id: u.user_id, display_name: u.display_name, avatar_url: u.avatar_url })}
            >
              <Avatar user={{ user_id: u.user_id, display_name: u.display_name, avatar_url: u.avatar_url }} size="sm" />
              {u.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="form-group">
        <label className="form-label">Labels</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {labels.map(label => {
            const active = form.labels.some(l => l.id === label.id);
            return (
              <button
                key={label.id}
                type="button"
                className="label-pill"
                style={{
                  background: active ? `${label.color}33` : 'var(--bg-hover)',
                  color:      active ? label.color        : 'var(--text-secondary)',
                  border:     active ? `1px solid ${label.color}` : '1px solid var(--border-default)',
                  cursor: 'pointer',
                }}
                onClick={() => toggleLabel(label)}
              >
                <span className="label-pill__dot" style={{ background: label.color }} />
                {label.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Epic */}
      <div className="form-group">
        <label className="form-label">Epic</label>
        <input
          className="form-input"
          placeholder="Epic name (optional)"
          value={form.epic ?? ''}
          onChange={e => set('epic', e.target.value || null)}
        />
      </div>

      <button type="submit" className="btn btn--primary">{submitLabel}</button>
    </form>
  );
}

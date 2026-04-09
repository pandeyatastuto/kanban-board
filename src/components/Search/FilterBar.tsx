/**
 * FilterBar — combinable filter chips for status, priority, type, assignee.
 * Active filters are shown as removable chips.
 */
import { useState, useEffect } from 'react';
import { useFilter } from '../../context/FilterContext';
import { useBoard }  from '../../context/BoardContext';
import type { User }  from '../../types/user';
import { getUsers }  from '../../api/userApi';
import type { IssuePriority, IssueType } from '../../types/issue';
import Dropdown from '../common/Dropdown';

const PRIORITY_OPTIONS: IssuePriority[] = ['critical', 'high', 'medium', 'low'];
const TYPE_OPTIONS:     IssueType[]     = ['task', 'bug', 'story', 'epic', 'subtask'];

export default function FilterBar() {
  const { filters, setFilter, clearFilters, hasActiveFilters } = useFilter();
  const { state } = useBoard();
  const [users, setUsers] = useState<User[]>([]);

  // Derived from the API — adapts to whatever columns the board returns
  const statusOptions = state.columns.map(col => ({ value: col.status, label: col.display_name }));

  useEffect(() => { getUsers().then(setUsers); }, []);

  const toggleValue = <T extends string>(key: 'status' | 'priority' | 'type' | 'assignee', value: T) => {
    const current = filters[key] as T[];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    setFilter(key, next as never);
  };

  return (
    <div className="filter-bar">
      {/* Status */}
      <Dropdown
        trigger={<button className={`filter-chip ${filters.status.length ? 'filter-chip--active' : ''}`}>Status {filters.status.length ? `(${filters.status.length})` : '▾'}</button>}
        items={statusOptions.map(s => ({ value: s.value, label: s.label, active: filters.status.includes(s.value) }))}
        onSelect={v => toggleValue('status', v)}
      />

      {/* Priority */}
      <Dropdown
        trigger={<button className={`filter-chip ${filters.priority.length ? 'filter-chip--active' : ''}`}>Priority {filters.priority.length ? `(${filters.priority.length})` : '▾'}</button>}
        items={PRIORITY_OPTIONS.map(p => ({ value: p, label: p, active: filters.priority.includes(p) }))}
        onSelect={v => toggleValue('priority', v as IssuePriority)}
      />

      {/* Type */}
      <Dropdown
        trigger={<button className={`filter-chip ${filters.type.length ? 'filter-chip--active' : ''}`}>Type {filters.type.length ? `(${filters.type.length})` : '▾'}</button>}
        items={TYPE_OPTIONS.map(t => ({ value: t, label: t, active: filters.type.includes(t as IssueType) }))}
        onSelect={v => toggleValue('type', v as IssueType)}
      />

      {/* Assignee */}
      <Dropdown
        trigger={<button className={`filter-chip ${filters.assignee.length ? 'filter-chip--active' : ''}`}>Assignee {filters.assignee.length ? `(${filters.assignee.length})` : '▾'}</button>}
        items={[
          { value: '__none__', label: 'Unassigned', active: filters.assignee.includes('__none__') },
          ...users.map(u => ({ value: u.user_id, label: u.display_name, active: filters.assignee.includes(u.user_id) })),
        ]}
        onSelect={v => toggleValue('assignee', v)}
      />

      {/* Clear all — only shown when filters are active */}
      {hasActiveFilters && (
        <button className="filter-clear" onClick={clearFilters}>Clear all</button>
      )}
    </div>
  );
}

/**
 * SwimlaneGroup — groups issues within a column by assignee, priority, or epic.
 * Rendered only when swimlaneGroupBy !== 'none'.
 */
import { useMemo } from 'react';
import type { Issue } from '../../types/issue';
import type { SwimlaneGroupBy } from '../../types/board';
import IssueCard from './IssueCard';

interface Props {
  issues:  Issue[];
  groupBy: SwimlaneGroupBy;
}

function getGroupKey(issue: Issue, groupBy: SwimlaneGroupBy): string {
  switch (groupBy) {
    case 'assignee': return issue.assignee?.display_name ?? 'Unassigned';
    case 'priority': return issue.priority;
    case 'epic':     return issue.epic ?? 'No Epic';
    default:         return 'All';
  }
}

export default function SwimlaneGroup({ issues, groupBy }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const issue of issues) {
      const key = getGroupKey(issue, groupBy);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(issue);
    }
    return map;
  }, [issues, groupBy]);

  return (
    <>
      {[...groups.entries()].map(([label, groupIssues]) => (
        <div key={label} className="swimlane">
          <div className="swimlane__header">{label}</div>
          {groupIssues.map(issue => (
            <IssueCard key={issue.issue_id} issue={issue} />
          ))}
        </div>
      ))}
    </>
  );
}

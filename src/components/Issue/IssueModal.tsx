/**
 * IssueModal — create-new-issue modal.
 * Pre-fills the status from the column that was clicked (KanbanColumn passes
 * '__new__<status>' as the selectedIssueId to signal a create flow).
 */
import Modal      from '../common/Modal';
import IssueForm  from './IssueForm';
import { useBoard } from '../../context/BoardContext';
import type { Issue } from '../../types/issue';

interface Props {
  defaultStatus?: string;
  onClose: () => void;
}

type FormData = Pick<Issue,
  'title' | 'description' | 'type' | 'priority' | 'status' |
  'assignee' | 'story_points' | 'labels' | 'epic'
>;

export default function IssueModal({ defaultStatus = 'todo', onClose }: Props) {
  const { dispatchCreate } = useBoard();

  const handleSubmit = async (data: FormData) => {
    await dispatchCreate({
      ...data,
      comment_count: 0,
      comments:      [],
      // Assign to the active sprint so the issue is visible on the board immediately.
      // sprint_id is set to 'sprint_1' (active sprint); backlog issues use null.
      sprint_id:     'sprint_1',
      position:      0,
    });
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Create Issue" size="md">
      <IssueForm
        initial={{ status: defaultStatus as Issue['status'] }}
        onSubmit={handleSubmit}
        submitLabel="Create Issue"
      />
    </Modal>
  );
}

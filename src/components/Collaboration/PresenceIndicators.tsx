/** PresenceIndicators — avatar stack showing who else is viewing the board */
import { useAuth } from '../../context/AuthContext';
import Avatar      from '../common/Avatar';
import Tooltip     from '../common/Tooltip';

export default function PresenceIndicators() {
  const { activeUsers } = useAuth();

  if (activeUsers.length === 0) return null;

  return (
    <div className="avatar-stack" title="Also viewing this board">
      {activeUsers.slice(0, 5).map(u => (
        <Tooltip key={u.user_id} text={u.display_name}>
          <Avatar
            user={{ user_id: u.user_id, display_name: u.display_name, avatar_url: u.avatar_url }}
            size="sm"
          />
        </Tooltip>
      ))}
      {activeUsers.length > 5 && (
        <div className="avatar avatar--sm" style={{ background: 'var(--border-strong)' }}>
          +{activeUsers.length - 5}
        </div>
      )}
    </div>
  );
}

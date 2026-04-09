/**
 * CommentSection — threaded comments with @mention autocomplete.
 * Scenario 3 (offline resilience): comments submitted while offline are
 * shown immediately with `is_pending: true` and a sending indicator.
 * They are synced once the connection restores via useOfflineQueue.
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import type { Comment }  from '../../types/issue';
import type { User }     from '../../types/user';
import { addComment }    from '../../api/commentApi';
import { useToast }      from '../../context/ToastContext';
import { useAuth }       from '../../context/AuthContext';
import Avatar            from '../common/Avatar';
import Spinner           from '../common/Spinner';

interface Props {
  issueId:  string;
  comments: Comment[];
  onUpdate: (comments: Comment[]) => void;
  users:    User[];
}

/** Render comment body and highlight @mentions */
function CommentBody({ body }: { body: string }) {
  const html = body.replace(/@(\w+)/g, '<span class="comment__mention">@$1</span>');
  return <p className="comment__body" dangerouslySetInnerHTML={{ __html: html }} />;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CommentSection({ issueId, comments, onUpdate, users }: Props) {
  const { addToast }    = useToast();
  const { currentUser } = useAuth();
  const [draft,    setDraft]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery]           = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect @mention in the draft; reset active index when suggestions change
  useEffect(() => {
    const match = draft.match(/@(\w*)$/);
    if (match) {
      const q = match[1].toLowerCase();
      setMentionQuery(q);
      setMentionSuggestions(users.filter(u => u.display_name.toLowerCase().includes(q)));
      setMentionActiveIndex(0);
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
      setMentionActiveIndex(0);
    }
  }, [draft, users]);

  const insertMention = (user: User) => {
    setDraft(prev => prev.replace(/@\w*$/, `@${user.display_name} `));
    setMentionQuery(null);
    setMentionActiveIndex(0);
    inputRef.current?.focus();
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text || !currentUser) return;

    setSubmitting(true);
    setDraft('');

    // Optimistic comment shown immediately
    const optimistic: Comment = {
      id:         `pending-${Date.now()}`,
      author:     { user_id: currentUser.user_id, display_name: currentUser.display_name, avatar_url: currentUser.avatar_url },
      body:       text,
      created_at: new Date().toISOString(),
      is_pending: true,
    };
    onUpdate([...comments, optimistic]);

    try {
      const confirmed = await addComment(issueId, text);
      // Replace the pending comment with the confirmed one
      onUpdate([...comments, confirmed]);
    } catch {
      // Remove optimistic comment and show error toast (or queue if offline)
      onUpdate(comments);
      addToast('Comment failed to send.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const dropdownOpen = mentionQuery !== null && mentionSuggestions.length > 0;

    if (dropdownOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionActiveIndex(i => (i + 1) % mentionSuggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionActiveIndex(i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionSuggestions[mentionActiveIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    // Ctrl/Cmd+Enter submits (only when mention dropdown is not open)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
  };

  return (
    <div className="comment-section">
      <p className="comment-section__title">Comments ({comments.length})</p>

      {comments.map(c => (
        <div key={c.id} className="comment">
          <Avatar user={c.author} size="sm" />
          <div className="comment__body-wrap">
            <div className="comment__header">
              <span className="comment__author">{c.author.display_name}</span>
              <span className="comment__time">{relativeTime(c.created_at)}</span>
              {c.is_pending && (
                <span className="comment__pending pulse">
                  <Spinner size="sm" /> sending…
                </span>
              )}
            </div>
            <CommentBody body={c.body} />
          </div>
        </div>
      ))}

      {/* Comment input with @mention autocomplete */}
      <div className="comment-input-row">
        <Avatar user={currentUser ? { user_id: currentUser.user_id, display_name: currentUser.display_name, avatar_url: currentUser.avatar_url } : null} size="sm" />
        <div className="comment-input-wrap">
          <textarea
            ref={inputRef}
            className="comment-input"
            placeholder="Add a comment… (Ctrl+Enter to submit, @mention users)"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
          />
          {/* @mention autocomplete dropdown — keyboard navigable */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="mention-dropdown" role="listbox">
              {mentionSuggestions.map((u, idx) => (
                <div
                  key={u.user_id}
                  className={`mention-item${idx === mentionActiveIndex ? ' mention-item--active' : ''}`}
                  role="option"
                  aria-selected={idx === mentionActiveIndex}
                  // onMouseDown keeps focus on the textarea
                  onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                  onMouseEnter={() => setMentionActiveIndex(idx)}
                >
                  <Avatar user={{ user_id: u.user_id, display_name: u.display_name, avatar_url: u.avatar_url }} size="sm" />
                  <span>{u.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="btn btn--primary btn--sm"
          onClick={submit}
          disabled={!draft.trim() || submitting}
        >
          {submitting ? <Spinner size="sm" /> : 'Send'}
        </button>
      </div>
    </div>
  );
}

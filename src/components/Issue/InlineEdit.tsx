/**
 * InlineEdit — click to reveal an input/textarea, blur/Enter to save.
 * Used for issue title and story points on the detail panel.
 */
import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface Props {
  value:       string;
  onSave:      (next: string) => void;
  multiline?:  boolean;
  className?:  string;
  placeholder?: string;
}

export default function InlineEdit({ value, onSave, multiline = false, className = '', placeholder }: Props) {
  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // Sync draft if the parent value changes externally
  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value); // restore if empty or unchanged
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { setDraft(value); setEditing(false); }
  };

  if (editing) {
    const sharedProps = {
      ref:         inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>,
      value:       draft,
      onChange:    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
      onBlur:      commit,
      onKeyDown,
      placeholder,
      className:   `inline-edit__input ${className}`,
    };

    return multiline
      ? <textarea {...sharedProps} rows={3} />
      : <input    {...sharedProps as React.InputHTMLAttributes<HTMLInputElement>} />;
  }

  return (
    <div
      className={`inline-edit__display ${className}`}
      onClick={() => setEditing(true)}
      title="Click to edit"
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(true); }}
    >
      {value || <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>}
    </div>
  );
}

import { createPortal } from 'react-dom';
import { useToast } from '../../context/ToastContext';
import type { Toast as ToastType } from '../../context/ToastContext';

const ICON: Record<ToastType['type'], string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span aria-hidden="true">{ICON[t.type]}</span>
          <span className="toast__message">{t.message}</span>
          <button
            className="toast__dismiss btn btn--ghost"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}

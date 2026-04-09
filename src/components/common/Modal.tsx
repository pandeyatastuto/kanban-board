/**
 * Modal — accessible portal modal.
 * Closes on overlay click and Escape key.
 */
import { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg';

interface Props {
  isOpen:    boolean;
  onClose:   () => void;
  title?:    string;
  size?:     ModalSize;
  children:  ReactNode;
  footer?:   ReactNode;
}

export default function Modal({ isOpen, onClose, title, size = 'md', children, footer }: Props) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`modal modal--${size}`}
        onClick={e => e.stopPropagation()} // prevent overlay close when clicking inside
      >
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button className="modal__close btn btn--ghost" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

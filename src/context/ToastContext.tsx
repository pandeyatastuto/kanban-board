/**
 * ToastContext — global notification queue.
 * Consumers call addToast(message, type); dismissal is automatic after 4 s.
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id:      string;
  message: string;
  type:    ToastType;
}

type Action =
  | { type: 'ADD';    toast: Toast }
  | { type: 'REMOVE'; id: string };

function reducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
}

interface ToastContextValue {
  toasts:      Toast[];
  addToast:    (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4_000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD', toast: { id, message, type } });
    setTimeout(() => removeToast(id), AUTO_DISMISS_MS);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

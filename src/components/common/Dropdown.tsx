/**
 * Dropdown — generic menu triggered by any child element.
 * Closes on outside click.
 */
import { useState, useRef, useEffect, ReactNode } from 'react';

export interface DropdownItem {
  label:    ReactNode;
  value:    string;
  icon?:    ReactNode;
  active?:  boolean;
  danger?:  boolean;
}

interface Props {
  trigger:  ReactNode;
  items:    DropdownItem[];
  onSelect: (value: string) => void;
  align?:   'left' | 'right';
}

export default function Dropdown({ trigger, items, onSelect, align = 'left' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div className={`dropdown__menu${align === 'right' ? ' dropdown__menu--right' : ''}`}>
          {items.map(item => (
            <div
              key={item.value}
              className={`dropdown__item ${item.active ? 'dropdown__item--active' : ''}`}
              onClick={() => { onSelect(item.value); setOpen(false); }}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

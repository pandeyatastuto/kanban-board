import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size    = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  Variant;
  size?:     Size;
  loading?:  boolean;
  icon?:     ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: Props) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    !children ? 'btn--icon' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="spinner spinner--sm" aria-label="Loading" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

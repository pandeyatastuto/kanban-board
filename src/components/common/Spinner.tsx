type Size = 'sm' | 'md' | 'lg';

interface Props { size?: Size; className?: string }

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`spinner spinner--${size} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

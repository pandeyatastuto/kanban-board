import { useState, ReactNode } from 'react';

interface Props {
  text:     string;
  children: ReactNode;
}

export default function Tooltip({ text, children }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && <div className="tooltip" role="tooltip">{text}</div>}
    </div>
  );
}

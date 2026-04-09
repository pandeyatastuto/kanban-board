import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/board',   icon: '⬛', label: 'Board'   },
  { to: '/backlog', icon: '📋', label: 'Backlog'  },
  { to: '/sprint',  icon: '🏃', label: 'Sprint'   },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span aria-hidden="true">🚀</span>
        <span>ProjectFlow</span>
      </div>
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar__nav-item${isActive ? ' sidebar__nav-item--active' : ''}`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

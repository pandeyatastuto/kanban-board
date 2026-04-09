import { useLocation }         from 'react-router-dom';
import { useTheme }            from '../../context/ThemeContext';
import { useBoard }            from '../../context/BoardContext';
import GlobalSearch            from '../Search/GlobalSearch';
import FilterBar               from '../Search/FilterBar';
import PresenceIndicators      from '../Collaboration/PresenceIndicators';
import Dropdown                from '../common/Dropdown';
import type { SwimlaneGroupBy } from '../../types/board';

const PAGE_TITLES: Record<string, string> = {
  '/board':   'Board',
  '/backlog': 'Backlog',
  '/sprint':  'Sprint',
};

const SWIMLANE_OPTIONS: { value: SwimlaneGroupBy; label: string }[] = [
  { value: 'none',     label: 'No grouping'  },
  { value: 'assignee', label: 'By Assignee'  },
  { value: 'priority', label: 'By Priority'  },
  { value: 'epic',     label: 'By Epic'      },
];

export default function Header() {
  const location        = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { state, setSwimlane } = useBoard();
  const isBoard = location.pathname === '/board' || location.pathname === '/';

  return (
    <header className="header">
      <span className="header__title">{PAGE_TITLES[location.pathname] ?? 'Board'}</span>
      <div className="header__spacer" />

      {isBoard && (
        <>
          <GlobalSearch />
          <FilterBar />
          {/* Swimlane grouping */}
          <Dropdown
            trigger={
              <button className="btn btn--secondary btn--sm">
                Group: {state.swimlaneGroupBy === 'none' ? 'None' : state.swimlaneGroupBy}
              </button>
            }
            items={SWIMLANE_OPTIONS.map(o => ({
              value:  o.value,
              label:  o.label,
              active: o.value === state.swimlaneGroupBy,
            }))}
            onSelect={v => setSwimlane(v as SwimlaneGroupBy)}
            align="right"
          />
        </>
      )}

      <div className="header__actions">
        <PresenceIndicators />
        {/* Theme toggle */}
        <button
          className="btn btn--ghost btn--icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}

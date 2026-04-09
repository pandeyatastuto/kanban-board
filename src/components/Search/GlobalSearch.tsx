/**
 * GlobalSearch — typeahead search across all issue titles and descriptions.
 * Results are shown in a dropdown; clicking navigates to the issue detail.
 */
import { useState, useEffect, useRef } from 'react';
import { useBoard }  from '../../context/BoardContext';
import { useFilter } from '../../context/FilterContext';
import type { Issue } from '../../types/issue';

function highlight(text: string, query: string): string {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<mark class="search-result-item__highlight">$1</mark>');
}

export default function GlobalSearch() {
  const { state, selectIssue }     = useBoard();
  const { filters, setFilter }     = useFilter();
  const [query,   setQuery]        = useState('');
  const [results, setResults]      = useState<Issue[]>([]);
  const [open,    setOpen]         = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync input when filters.search is set externally (URL hydration / clearFilters)
  useEffect(() => {
    setQuery(filters.search);
  }, [filters.search]);

  // Typeahead search across the loaded board
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setOpen(false); return; }

    const all = state.columns.flatMap(c => c.issues);
    const matched = all.filter(
      i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    ).slice(0, 8);

    setResults(matched);
    setOpen(true);
    // Also update FilterContext so the board reflects the search
    setFilter('search', query.trim());
  }, [query, state.columns, setFilter]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (issue: Issue) => {
    selectIssue(issue.issue_id);
    setQuery('');
    setOpen(false);
    setFilter('search', '');
  };

  const clearSearch = () => {
    setQuery('');
    setFilter('search', '');
    setOpen(false);
  };

  return (
    <div className="global-search" ref={wrapRef}>
      <div className="global-search__input-wrap">
        <span className="global-search__icon" aria-hidden="true">🔍</span>
        <input
          className="global-search__input"
          placeholder="Search issues…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length) setOpen(true); }}
          aria-label="Search issues"
        />
        {query && (
          <button className="btn btn--ghost btn--icon" style={{ padding: '2px' }} onClick={clearSearch} aria-label="Clear search">✕</button>
        )}
      </div>

      {open && (
        <div className="global-search__results" role="listbox">
          {results.length === 0 ? (
            <div className="search-empty">No results for "{query}"</div>
          ) : (
            results.map(issue => (
              <div
                key={issue.issue_id}
                className="search-result-item"
                role="option"
                aria-selected={false}
                onClick={() => handleSelect(issue)}
              >
                <span className="search-result-item__id">{issue.issue_id}</span>
                <span
                  className="search-result-item__title"
                  dangerouslySetInnerHTML={{ __html: highlight(issue.title, query.trim()) }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

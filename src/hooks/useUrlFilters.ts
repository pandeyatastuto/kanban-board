/**
 * useUrlFilters — two-way sync between FilterContext and URL search params.
 *
 * Behaviour:
 *  - On mount at /board: hydrates FilterContext from URL params.
 *  - On every filter change: writes FilterContext → URL (replace, no history entry).
 *  - On navigation away from /board: clears FilterContext so the next route starts clean.
 */
import { useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useFilter } from '../context/FilterContext';
import { EMPTY_FILTERS } from '../types/filter';
import type { FilterState } from '../types/filter';

function parseSearchParams(params: URLSearchParams): FilterState {
  return {
    search:   params.get('search') ?? '',
    status:   params.getAll('status'),
    priority: params.getAll('priority') as FilterState['priority'],
    type:     params.getAll('type') as FilterState['type'],
    assignee: params.getAll('assignee'),
    label:    params.getAll('label'),
    sprint:   params.getAll('sprint'),
  };
}

function toSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search)           params.set('search', filters.search);
  filters.status.forEach(v =>   params.append('status',   v));
  filters.priority.forEach(v => params.append('priority', v));
  filters.type.forEach(v =>     params.append('type',     v));
  filters.assignee.forEach(v => params.append('assignee', v));
  filters.label.forEach(v =>    params.append('label',    v));
  filters.sprint.forEach(v =>   params.append('sprint',   v));
  return params;
}

function isBoard(pathname: string) {
  return pathname === '/board' || pathname === '/';
}

export function useUrlFilters() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, applyPreset, clearFilters } = useFilter();

  const onBoard        = isBoard(location.pathname);
  const prevPath       = useRef(location.pathname);
  // true → skip the write-to-URL effect on the very first render of each /board visit
  // (we haven't hydrated yet, so writing would erase the URL params)
  const skipFirstWrite = useRef(true);

  // ── 1. Hydrate from URL on first render at /board ──────────────────────────
  useEffect(() => {
    if (!onBoard) return;
    if (searchParams.toString()) {
      applyPreset(parseSearchParams(searchParams));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount only

  // ── 2. Write FilterContext → URL whenever filters change ───────────────────
  useEffect(() => {
    if (!onBoard) return;
    // Skip the first run: the filters haven't been hydrated from URL yet,
    // and we must not overwrite the URL params with empty values.
    if (skipFirstWrite.current) {
      skipFirstWrite.current = false;
      return;
    }
    setSearchParams(toSearchParams(filters), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ── 3. Clear filters when navigating away from /board ─────────────────────
  useEffect(() => {
    const prev = prevPath.current;
    prevPath.current = location.pathname;

    if (isBoard(prev) && !onBoard) {
      // Reset the skip-flag so the next /board visit re-hydrates cleanly
      skipFirstWrite.current = true;
      clearFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}

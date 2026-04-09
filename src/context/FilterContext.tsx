/**
 * FilterContext — manages search + filter state and saved presets.
 * The useUrlFilters hook (hooks/) keeps this in sync with URL params.
 */
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import type { FilterState, FilterPreset } from '../types/filter';
import { EMPTY_FILTERS } from '../types/filter';

type FilterKey = keyof FilterState;

type Action =
  | { type: 'SET_FILTER'; key: FilterKey; value: FilterState[FilterKey] }
  | { type: 'CLEAR_ALL' }
  | { type: 'APPLY_PRESET'; filters: FilterState }
  | { type: 'SAVE_PRESET';  preset: FilterPreset }
  | { type: 'DELETE_PRESET'; id: string };

interface State {
  filters: FilterState;
  presets: FilterPreset[];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, [action.key]: action.value } };
    case 'CLEAR_ALL':
      return { ...state, filters: { ...EMPTY_FILTERS } };
    case 'APPLY_PRESET':
      return { ...state, filters: action.filters };
    case 'SAVE_PRESET':
      return { ...state, presets: [...state.presets, action.preset] };
    case 'DELETE_PRESET':
      return { ...state, presets: state.presets.filter(p => p.id !== action.id) };
    default:
      return state;
  }
}

interface FilterContextValue {
  filters:       FilterState;
  presets:       FilterPreset[];
  setFilter:     <K extends FilterKey>(key: K, value: FilterState[K]) => void;
  clearFilters:  () => void;
  applyPreset:   (filters: FilterState) => void;
  savePreset:    (name: string) => void;
  deletePreset:  (id: string) => void;
  hasActiveFilters: boolean;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    filters: { ...EMPTY_FILTERS },
    presets: [],
  });

  const setFilter = useCallback(<K extends FilterKey>(key: K, value: FilterState[K]) => {
    dispatch({ type: 'SET_FILTER', key, value });
  }, []);

  const clearFilters  = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);
  const applyPreset   = useCallback((filters: FilterState) => dispatch({ type: 'APPLY_PRESET', filters }), []);
  const deletePreset  = useCallback((id: string) => dispatch({ type: 'DELETE_PRESET', id }), []);

  const savePreset = useCallback((name: string) => {
    const preset: FilterPreset = {
      id:      `preset-${Date.now()}`,
      name,
      filters: { ...state.filters },
    };
    dispatch({ type: 'SAVE_PRESET', preset });
  }, [state.filters]);

  const hasActiveFilters =
    state.filters.search !== '' ||
    state.filters.status.length > 0 ||
    state.filters.priority.length > 0 ||
    state.filters.type.length > 0 ||
    state.filters.assignee.length > 0 ||
    state.filters.label.length > 0 ||
    state.filters.sprint.length > 0;

  return (
    <FilterContext.Provider value={{
      filters: state.filters,
      presets: state.presets,
      setFilter,
      clearFilters,
      applyPreset,
      savePreset,
      deletePreset,
      hasActiveFilters,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used inside <FilterProvider>');
  return ctx;
}

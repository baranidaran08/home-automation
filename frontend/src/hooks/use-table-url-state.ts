'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from './use-debounce';

export interface UrlFilterConfig {
  /** Query-string key, e.g. 'category', 'brand', 'status'. */
  key: string;
  /** Value that means "no filter" — omitted from the URL (e.g. 'all'). */
  defaultValue?: string;
}

interface Options {
  filters?: UrlFilterConfig[];
  searchDebounceMs?: number;
}

interface CommitOptions {
  /** Use history.replace instead of push (no new Back/Forward entry). */
  replace?: boolean;
}

/**
 * URL-as-source-of-truth state for a paginated / searchable / filterable table.
 *
 * `page`, `search`, and every filter live in the query string, so refresh,
 * deep links, and the browser Back/Forward buttons all "just work" with no extra
 * code. Categories, Products, and Templates share this single hook so the URL
 * synchronization logic is written once (no duplication).
 *
 * Reads are always taken straight from the URL; writes go through `commit`,
 * which mutates the current query string and navigates. The backend, API
 * services, and TanStack Query hooks are untouched — the caller simply feeds the
 * values this hook derives into the existing `useProducts` / `useCategories` /
 * `useTemplates` hooks exactly as before.
 */
export function useTableUrlState({ filters = [], searchDebounceMs = 400 }: Options = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Committed values, read straight from the URL (the single source of truth).
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';

  const filterSignature = filters.map((f) => `${f.key}:${f.defaultValue ?? ''}`).join('|');
  const filterValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of filters) out[f.key] = searchParams.get(f.key) ?? f.defaultValue ?? '';
    return out;
    // filterSignature captures the (stable) filter config; searchParams captures the values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filterSignature]);

  // --- A STABLE commit(). It reads the latest URL from a ref, so its identity
  // never changes across navigations. That stability is what stops effects that
  // depend on it from re-firing on every URL change (which would fight the
  // Back/Forward buttons and the debounced search).
  const liveRef = useRef({ searchParams, pathname });
  liveRef.current = { searchParams, pathname };

  const defaultsRef = useRef<Record<string, string | undefined>>({});
  defaultsRef.current = Object.fromEntries(filters.map((f) => [f.key, f.defaultValue]));

  const commit = useCallback(
    (updates: Record<string, string | number | null | undefined>, opts: CommitOptions = {}) => {
      const { searchParams: sp, pathname: pn } = liveRef.current;
      const params = new URLSearchParams(sp.toString());

      for (const [key, raw] of Object.entries(updates)) {
        const value = raw == null ? '' : String(raw);
        const isDefault = key in defaultsRef.current && value === (defaultsRef.current[key] ?? '');
        // `page` is always kept so the URL is canonical (…?page=N). Other keys
        // are dropped when empty or equal to their "no filter" default, keeping
        // the URL clean and shareable.
        if (key !== 'page' && (value === '' || isDefault)) params.delete(key);
        else params.set(key, value);
      }

      const qs = params.toString();
      const url = qs ? `${pn}?${qs}` : pn;
      // `scroll: false` keeps the viewport steady when paging/filtering.
      if (opts.replace) router.replace(url, { scroll: false });
      else router.push(url, { scroll: false });
    },
    [router]
  );

  // --- Public setters ---

  /** Change page. Uses push so Back/Forward navigate between pages. */
  const setPage = useCallback(
    (next: number, opts?: CommitOptions) => commit({ page: next }, opts),
    [commit]
  );

  /** Change a filter. Resets to page 1 (a new query starts at the top). */
  const setFilter = useCallback(
    (key: string, value: string) => commit({ [key]: value, page: 1 }),
    [commit]
  );

  // --- Search box: snappy local input, debounced write to the URL ---
  const [searchInput, setSearchInput] = useState(search);
  const debounced = useDebounce(searchInput, searchDebounceMs);
  const searchRef = useRef(search);

  // Reflect external URL changes (Back/Forward, a shared link) into the input.
  useEffect(() => {
    searchRef.current = search;
    setSearchInput(search);
  }, [search]);

  // Write the debounced input to the URL. `replace` avoids a history entry per
  // keystroke; page resets to 1 for a new search term. The ref guard ensures we
  // only write on genuine user input, never echoing an external URL change.
  useEffect(() => {
    if (debounced === searchRef.current) return;
    searchRef.current = debounced;
    commit({ search: debounced, page: 1 }, { replace: true });
  }, [debounced, commit]);

  // --- Canonical URL: ensure ?page=N is always present (…?page=1 on first load).
  const normalized = useRef(false);
  useEffect(() => {
    if (normalized.current) return;
    normalized.current = true;
    if (!searchParams.get('page')) commit({ page: 1 }, { replace: true });
    // Run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    page,
    search,
    searchInput,
    setSearchInput,
    filters: filterValues,
    setPage,
    setFilter,
  };
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchNetwork, SEARCH_SUGGESTIONS, type SearchResult } from "@/lib/search";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  athlete: "Athlete",
  sport: "Sport",
  country: "Country",
};

/**
 * Global discovery. Selecting a result is the strongest single interaction on
 * the page: the overlay closes, the planet turns to the coordinates, and the
 * matching marker activates with its card attached.
 */
export function GlobalSearch() {
  const isOpen = useGlobalExperience((s) => s.isSearchOpen);
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);

  // Cmd/Ctrl+K anywhere on the site.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        trackEvent("search_opened");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setSearchOpen]);

  return (
    <AnimatePresence>
      {isOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
    </AnimatePresence>
  );
}

/**
 * Mounted only while the overlay is open, so the query and highlight reset by
 * unmounting rather than by an effect that writes state on close.
 */
function SearchPanel({ onClose }: { onClose: () => void }) {
  const selectAthlete = useGlobalExperience((s) => s.selectAthlete);
  const selectSport = useGlobalExperience((s) => s.selectSport);
  const selectCountry = useGlobalExperience((s) => s.selectCountry);
  const focusOn = useGlobalExperience((s) => s.focusOn);

  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = "global-search-results";

  const results = useMemo(() => searchNetwork(query), [query]);
  // Guards against a stale index if the result list shrinks between renders.
  const activeIndex = Math.min(highlighted, Math.max(results.length - 1, 0));

  useEffect(() => {
    // Focus after the entrance transition so the caret doesn't jump.
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  function commit(result: SearchResult) {
    trackEvent("search_result_selected", { kind: result.kind, id: result.id });

    if (result.kind === "athlete") {
      selectSport(null);
      selectAthlete(result.id);
      focusOn(result.latitude, result.longitude);
    } else if (result.kind === "country") {
      selectCountry(result.id);
      selectAthlete(null);
      focusOn(result.latitude, result.longitude);
    } else {
      // A sport has no single coordinate; committing the filter re-tints the
      // whole globe instead, which is the more meaningful response.
      selectAthlete(null);
      useGlobalExperience.setState({ selectedSport: result.id });
    }

    onClose();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlighted((i) => (Math.min(i, results.length - 1) + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (Math.min(i, results.length - 1) - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      commit(results[activeIndex]);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[14vh]"
      data-globe-ignore
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: -14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Search the global athlete network"
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/12 bg-[rgba(6,22,34,0.94)] shadow-[0_40px_120px_-40px_rgba(0,0,0,1)] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 transition-colors focus-within:border-accent/45">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Reset in the handler, not an effect — the highlight belongs to
              // the query it was chosen against.
              setHighlighted(0);
            }}
            onKeyDown={onKeyDown}
            type="search"
            placeholder="Search athletes, sports or countries"
            aria-label="Search athletes, sports or countries"
            aria-controls={listId}
            aria-autocomplete="list"
            className="w-full bg-transparent py-4 text-base text-fg outline-none focus-visible:outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-faint transition-colors hover:text-fg"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>

        {query.length === 0 ? (
          <div className="px-5 py-5">
            <p className="font-display text-[0.55rem] font-semibold tracking-[0.22em] text-faint uppercase">
              Try
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.query}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion.query);
                    setHighlighted(0);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-[0.78rem] text-muted transition-colors hover:border-accent/60 hover:text-fg"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-faint">
            Nothing in the demo network matches “{query}”.
          </p>
        ) : (
          <ul id={listId} role="listbox" className="max-h-[52vh] overflow-y-auto py-2">
            {results.map((result, i) => (
              <li key={`${result.kind}-${result.id}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseEnter={() => setHighlighted(i)}
                  onClick={() => commit(result)}
                  className={cn(
                    "flex w-full items-center gap-3.5 px-5 py-3 text-left transition-colors",
                    i === activeIndex ? "bg-white/[0.06]" : "hover:bg-white/[0.03]",
                  )}
                >
                  <span className="w-6 shrink-0 text-center text-base leading-none" aria-hidden>
                    {"flag" in result ? result.flag : "🏅"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.92rem] text-fg">{result.title}</span>
                    <span className="block truncate text-[0.78rem] text-faint">
                      {result.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-[0.55rem] font-semibold tracking-[0.18em] text-faint uppercase">
                    {KIND_LABEL[result.kind]}
                  </span>
                  {i === activeIndex && (
                    <CornerDownLeft className="size-3.5 shrink-0 text-accent" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-white/[0.08] px-5 py-2.5">
          <p className="font-display text-[0.55rem] font-semibold tracking-[0.18em] text-faint uppercase">
            Demo network
          </p>
          <p className="hidden gap-3 font-display text-[0.55rem] font-semibold tracking-[0.14em] text-faint uppercase sm:flex">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

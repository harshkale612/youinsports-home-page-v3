"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CornerDownLeft, Play, Search, X } from "lucide-react";
import type { FaqEntry } from "@/data/faq";
import { CONTACT_PATH } from "@/data/faq";
import { openEntry } from "@/features/faq/navigation";
import { ENTRIES, TOPIC_OF_ENTRY, hasVideo } from "@/features/faq/topics";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/** How many results the list shows at most. */
const LIMIT = 6;

/** What the empty box suggests, typed out one after another. */
const EXAMPLES = ["reset my password", "cancel anytime", "fix a PGN file", "find sponsors", "parent account"];

/** Lower case, curly apostrophes made straight, so "don’t" finds "don't". */
function normalise(text: string) {
  return text.toLowerCase().replace(/[’‘]/g, "'");
}

const INDEX = [...ENTRIES.values()].map((entry) => ({
  entry,
  question: normalise(entry.question),
  answer: normalise(entry.answer),
  tags: normalise(entry.tags.join(" ")),
  topic: normalise(TOPIC_OF_ENTRY.get(entry.id)?.category ?? ""),
}));

/**
 * Every entry that holds all the query's words, best first: a word in the
 * question counts most, then in the tags or topic, then in the answer.
 */
function search(query: string) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return { terms, results: [] as FaqEntry[] };
  const results = INDEX.map((item) => {
    let score = 0;
    for (const term of terms) {
      const inQuestion = item.question.includes(term);
      const inTags = item.tags.includes(term) || item.topic.includes(term);
      const inAnswer = item.answer.includes(term);
      if (!inQuestion && !inTags && !inAnswer) return null;
      score += (inQuestion ? 4 : 0) + (inTags ? 2 : 0) + (inAnswer ? 1 : 0);
    }
    return { entry: item.entry, score };
  })
    .filter((hit): hit is { entry: FaqEntry; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .map((hit) => hit.entry);
  return { terms, results };
}

/** `text` with every search word picked out in orange. */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-orange-soft px-0.5 text-orange-strong">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** A line of the answer around the first search word it holds, or its opening if none. */
function excerpt(answer: string, terms: string[]) {
  const lower = normalise(answer);
  const at = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0];
  if (at === undefined || at < 40) return answer.slice(0, 110) + (answer.length > 110 ? "…" : "");
  const start = answer.lastIndexOf(" ", at - 30) + 1;
  return "…" + answer.slice(start, start + 110) + (start + 110 < answer.length ? "…" : "");
}

/**
 * The hero's search: one large box over all 27 answers, matching as the
 * reader types. A result opens its answer in the list below and brings it
 * into view. Keys: ↑/↓ to move, ↵ to open, esc to clear, and "/" from
 * anywhere on the page to start typing.
 *
 * It's an ARIA combobox: the box keeps focus while the arrow keys move a
 * highlight through the results.
 */
export function FaqSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { terms, results } = useMemo(() => search(query), [query]);
  const shown = results.slice(0, LIMIT);
  const expanded = open && query.trim().length > 0;

  // "/" anywhere on the page puts the cursor in the box.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function choose(entry: FaqEntry) {
    trackEvent("faq_searched", { query, id: entry.id });
    setOpen(false);
    inputRef.current?.blur();
    openEntry(entry.id);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!shown.length) return;
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + shown.length) % shown.length);
    } else if (event.key === "Enter") {
      const entry = shown[active];
      if (expanded && entry) {
        event.preventDefault();
        choose(entry);
      }
    } else if (event.key === "Escape") {
      if (query) {
        event.preventDefault();
        setQuery("");
      } else {
        inputRef.current?.blur();
      }
      setOpen(false);
    }
  }

  return (
    <div className="group/search relative w-full max-w-2xl">
      {/* The glow that gathers round the box while it has focus. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full bg-[linear-gradient(90deg,rgb(var(--orange-rgb)/0.4),rgb(var(--accent-rgb)/0.4))] opacity-0 blur-2xl transition-opacity duration-500 group-focus-within/search:opacity-[calc(0.45_+_0.55*var(--glow))]"
      />

      <div className="group glass-brand relative flex h-16 items-center rounded-full md:h-[4.25rem]">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-6 size-5 text-faint transition-colors duration-300 group-focus-within:text-accent-strong"
        />

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search the questions and answers"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && shown[active] ? `${listId}-${shown[active].id}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          // The site's focus ring is for controls; the box shows focus with its glow.
          className="h-full w-full rounded-full! bg-transparent pr-28 pl-14 text-[1.02rem] text-fg outline-none! [&::-webkit-search-cancel-button]:hidden md:pl-16 md:text-lg"
        />

        {!query && <Placeholder />}

        <div className="absolute right-3 flex items-center gap-2">
          {query ? (
            <button
              type="button"
              aria-label="Clear the search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="flex size-9 items-center justify-center rounded-full text-faint transition-colors hover:bg-tint/[0.06] hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : (
            <kbd
              aria-hidden
              className="hidden h-8 min-w-8 items-center justify-center rounded-lg border border-tint/10 bg-tint/[0.04] px-2 font-display text-xs text-faint md:flex"
            >
              /
            </kbd>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {expanded ? (results.length ? `${results.length} answers found` : "No answers found") : ""}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease }}
            className="absolute inset-x-0 top-full z-40 mt-3 origin-top overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-popover text-left shadow-[var(--shadow-popover)] backdrop-blur-xl"
          >
            {shown.length ? (
              <ul id={listId} role="listbox" aria-label="Matching answers" className="max-h-[min(26rem,60vh)] overflow-y-auto p-2">
                {shown.map((entry, i) => {
                  const topic = TOPIC_OF_ENTRY.get(entry.id);
                  const Icon = topic?.icon;
                  return (
                    <li
                      key={entry.id}
                      id={`${listId}-${entry.id}`}
                      role="option"
                      aria-selected={i === active}
                      // Keeps the box focused, so the list stays open until a choice.
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(entry)}
                      className={cn(
                        "flex cursor-pointer items-start gap-3.5 rounded-2xl px-4 py-3.5 transition-colors duration-150",
                        i === active ? "bg-option-active" : "hover:bg-option-hover",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
                          i === active
                            ? "border-accent-line bg-accent-soft text-accent-strong"
                            : "border-tint/10 bg-tint/[0.03] text-faint",
                        )}
                      >
                        {Icon && <Icon className="size-4" aria-hidden />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[0.95rem] leading-snug font-semibold text-fg">
                          <Highlight text={entry.question} terms={terms} />
                        </span>
                        <span className="mt-1 line-clamp-1 block text-[0.82rem] text-muted">
                          <Highlight text={excerpt(entry.answer, terms)} terms={terms} />
                        </span>
                        <span className="mt-1.5 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.12em] text-faint uppercase">
                          {topic?.category}
                          {hasVideo(entry) && (
                            <span className="flex items-center gap-1 text-orange-strong">
                              <Play className="size-2.5 fill-current" aria-hidden />
                              Video
                            </span>
                          )}
                        </span>
                      </span>
                      <CornerDownLeft
                        aria-hidden
                        className={cn(
                          "mt-1 size-4 shrink-0 text-faint transition-opacity",
                          i === active ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-7 text-center">
                <p className="font-display text-[0.98rem] font-semibold text-fg">
                  No answers match “{query.trim()}”
                </p>
                <p className="mt-1.5 text-[0.88rem] text-muted">Try fewer words, or ask the team directly.</p>
                <a
                  href={CONTACT_PATH}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => trackEvent("faq_cta_clicked", { target: "search-empty", query })}
                  className="group mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-accent-strong"
                >
                  Email our team
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </div>
            )}
            {results.length > LIMIT && (
              <p className="border-t border-tint/[0.07] px-6 py-3 text-[0.75rem] text-faint">
                Showing the {LIMIT} best of {results.length} answers. Add a word to narrow it down.
              </p>
            )}
            <p className="hidden border-t border-tint/[0.07] px-6 py-2.5 text-[0.7rem] text-faint md:block">
              <kbd className="font-display">↑</kbd> <kbd className="font-display">↓</kbd> to move ·{" "}
              <kbd className="font-display">↵</kbd> to open · <kbd className="font-display">esc</kbd> to clear
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Suggestions typed into the empty box, one after another, then erased. A
 * picture of the box in use; the input's own label names it for assistive
 * technology, so this is hidden from it. With reduced motion it holds still.
 */
function Placeholder() {
  const [text, setText] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(() => setText(EXAMPLES[0]), 0);
      return () => window.clearTimeout(timer);
    }
    let example = 0;
    let length = 0;
    let deleting = false;
    let timer = 0;
    const tick = () => {
      const word = EXAMPLES[example];
      if (!deleting) {
        length += 1;
        setText(word.slice(0, length));
        if (length === word.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1800);
          return;
        }
        timer = window.setTimeout(tick, 70 + Math.random() * 50);
      } else {
        length -= 1;
        setText(word.slice(0, length));
        if (length === 0) {
          deleting = false;
          example = (example + 1) % EXAMPLES.length;
          timer = window.setTimeout(tick, 400);
          return;
        }
        timer = window.setTimeout(tick, 32);
      }
    };
    timer = window.setTimeout(tick, 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute left-14 flex items-center text-[1.02rem] text-faint md:left-16 md:text-lg"
    >
      Try “<span className="text-muted">{text}</span>
      <span className="ml-px inline-block h-[1.15em] w-px animate-pulse bg-accent" />”
    </span>
  );
}

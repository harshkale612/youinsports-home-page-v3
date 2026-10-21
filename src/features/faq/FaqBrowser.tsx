"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Primitives";
import { FaqItem } from "@/features/faq/FaqItem";
import { FaqTopicBar } from "@/features/faq/FaqTopicBar";
import { PANEL_DURATION, afterFold, foldsAbove, scrollToRest } from "@/features/faq/navigation";
import { FAQ_TOPICS } from "@/features/faq/topics";
import { FAQ_ENTRY_IDS } from "@/data/faq";
import { readHash, replaceHash, useLocationHash } from "@/hooks/useLocationHash";
import { trackEvent } from "@/lib/analytics";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8% 0px" },
};

/**
 * Every question, grouped by category, in one column under a tray of the
 * categories that rides along at the top of the screen.
 *
 * The URL's hash is the one record of which entry is open: opening an entry
 * points the URL at it, closing it clears the hash, and a link to
 * `/faq#<id>` arrives with that entry open. There is only one hash, so only
 * one entry is ever open.
 */
export function FaqBrowser() {
  const hash = useLocationHash();
  const expanded = FAQ_ENTRY_IDS.has(hash) ? hash : null;
  const activeCategory = useActiveCategory();

  // Deep links: bring the linked entry into view on arrival, and whenever
  // the hash changes from outside (the address bar, a link). The entries'
  // own toggles change the hash with `replaceHash`, which fires no
  // `hashchange`, so opening an entry never scrolls the page under the reader.
  useEffect(() => {
    let cancel = () => {};

    function revealLinkedEntry(previousId?: string) {
      const target = document.getElementById(readHash());
      if (!target || !FAQ_ENTRY_IDS.has(target.id)) return;
      cancel();
      // An entry open above this one is folding away and carrying the target
      // up with it, so measure once the fold has finished. On arrival, a
      // moment for the entry to open first is enough.
      if (previousId && foldsAbove(previousId, target.id)) {
        cancel = afterFold(previousId, () => scrollToRest(target));
      } else {
        const timer = window.setTimeout(() => scrollToRest(target), 50);
        cancel = () => window.clearTimeout(timer);
      }
    }

    function onHashChange(event: HashChangeEvent) {
      revealLinkedEntry(new URL(event.oldURL).hash.slice(1));
    }

    revealLinkedEntry();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancel();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  function toggle(id: string) {
    if (expanded === id) {
      replaceHash(null);
      return;
    }
    if (expanded && foldsAbove(expanded, id)) holdInPlace(id, expanded);
    replaceHash(id);
    trackEvent("faq_question_opened", { id });
  }

  return (
    // Scroll anchoring is off here because `holdInPlace` does that job, and
    // the two together would correct the scroll twice.
    <section aria-label="Questions by category" className="relative py-12 [overflow-anchor:none] md:py-20">
      <Container className="max-w-240">
        <FaqTopicBar active={activeCategory} />

        <div className="flex flex-col gap-14 md:gap-16">
          {FAQ_TOPICS.map((topic) => (
            <CategorySection key={topic.id} topic={topic} expanded={expanded} onToggle={toggle} />
          ))}
        </div>
      </Container>
    </section>
  );
}

/** One category: its mark, its title, how many questions it holds, and the questions. */
function CategorySection({
  topic,
  expanded,
  onToggle,
}: {
  topic: (typeof FAQ_TOPICS)[number];
  expanded: string | null;
  onToggle: (id: string) => void;
}) {
  const { id, category, questions, icon: Icon } = topic;
  const count = questions.length;

  return (
    // Focusable so the topic bar can hand focus to it; it is never tabbed
    // to. The scroll margin clears the site bar and the topic bar under it.
    <section id={id} tabIndex={-1} aria-labelledby={`${id}-heading`} className="scroll-mt-40 outline-none!">
      <motion.div {...reveal} transition={{ duration: 0.7, ease }} className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-tint/10 bg-tile text-accent-strong shadow-[var(--shadow-tile)]">
          <Icon className="size-[1.1rem]" aria-hidden />
        </span>
        <h2 id={`${id}-heading`} className="font-display text-2xl font-bold tracking-[-0.01em] text-fg">
          {category}
        </h2>
        <span className="tabular inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-accent/10 px-2 text-[0.8125rem] font-bold text-accent">
          {count}
          <span className="sr-only"> {count === 1 ? "question" : "questions"}</span>
        </span>
      </motion.div>

      <ul className="flex flex-col gap-4">
        {questions.map((entry, i) => (
          <motion.li key={entry.id} {...reveal} transition={{ duration: 0.7, ease, delay: Math.min(i, 4) * 0.06 }}>
            <FaqItem entry={entry} open={expanded === entry.id} onToggle={onToggle} />
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The category the reader is in: the last one whose top has passed a line a
 * third of the way down the screen, so between sections the one above stays
 * current.
 *
 * It's read from the layout at most once a frame, whenever the page scrolls
 * or resizes or a section changes size (an answer opening moves everything
 * below it without any scroll). Watching for crossings instead misses jumps
 * that skip from one gap between sections straight to another.
 */
function useActiveCategory() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const { id } of FAQ_TOPICS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const sections = new ResizeObserver(schedule);
    for (const { id } of FAQ_TOPICS) {
      const section = document.getElementById(id);
      if (section) sections.observe(section);
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      sections.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return active;
}

/**
 * Opening an entry closes the one that was open. When that one sits above,
 * its answer folding away would slide the new entry up from under the
 * pointer, so the page scrolls along with the fold to keep the new entry
 * still. Any scrolling of the reader's own ends the hold.
 *
 * The folding card is watched with a ResizeObserver, whose callbacks run
 * after layout and before paint, so each correction lands in the same frame
 * as the movement it cancels, whatever moved it.
 */
function holdInPlace(id: string, foldingId: string) {
  const target = document.getElementById(id);
  const folding = document.getElementById(foldingId);
  if (!target || !folding) return;
  const top = target.getBoundingClientRect().top;

  const observer = new ResizeObserver(() => {
    const drift = target.getBoundingClientRect().top - top;
    if (Math.abs(drift) >= 0.5) window.scrollBy(0, drift);
  });

  const release = () => {
    observer.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener("wheel", release);
    window.removeEventListener("touchmove", release);
  };

  observer.observe(folding);
  const timer = window.setTimeout(release, PANEL_DURATION * 1000 + 200);
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchmove", release, { passive: true });
}

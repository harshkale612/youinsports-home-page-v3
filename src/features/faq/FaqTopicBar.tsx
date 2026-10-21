"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { FAQ_TOPICS } from "@/features/faq/topics";
import { jumpToCategory, scrollBehavior } from "@/features/faq/navigation";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The categories, as a frosted tray of pills above the questions. It rides
 * just under the site bar while the list scrolls past, and the category
 * being read wears the site's "selected" finish, which slides from pill to
 * pill as the reader moves on.
 *
 * Where the tray is narrower than its pills (phones, small tablets) it
 * scrolls sideways, and keeps the current pill in view on its own.
 */
export function FaqTopicBar({ active }: { active: string | null }) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  // Brings the current pill into the middle of the tray. Only the tray
  // scrolls: `scrollIntoView` would reach the page too and could cut short a
  // glide the reader started.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const pill = active ? scroller?.querySelector<HTMLElement>(`[data-topic="${active}"]`) : null;
    if (!scroller || !pill || scroller.scrollWidth <= scroller.clientWidth) return;
    const left = pill.offsetLeft - (scroller.clientWidth - pill.offsetWidth) / 2;
    scroller.scrollTo({ left, behavior: scrollBehavior() });
  }, [active]);

  return (
    // Sticks a little below the site bar (77px), so the tray floats rather
    // than butting against it.
    <div className="pointer-events-none sticky top-[5.5rem] z-30 mb-10 flex justify-center md:mb-14">
      <motion.nav
        aria-label="FAQ topics"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        // As wide as its pills, up to the screen's gutters: wider than the
        // list's column when it needs to be, centred over it either way.
        className="pointer-events-auto relative w-max max-w-[calc(100vw-3rem)] shrink-0 rounded-full border border-[var(--glass-border)] bg-popover p-1.5 shadow-[var(--shadow-popover)] backdrop-blur-xl"
      >
        {/* The logo's colours along the tray's top edge. */}
        <span aria-hidden className="rule-brand absolute inset-x-10 top-0 opacity-70" />

        <ul
          ref={scrollerRef}
          className="hide-scrollbar flex gap-1 overflow-x-auto rounded-full [mask-image:linear-gradient(90deg,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] xl:[mask-image:none]"
        >
          {FAQ_TOPICS.map(({ id, category: label, icon: Icon }) => {
            const current = active === id;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  data-topic={id}
                  onClick={(event) => jumpToCategory(event, id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-medium whitespace-nowrap transition-colors duration-300",
                    current ? "text-fg" : "text-muted hover:bg-tint/[0.05] hover:text-fg",
                  )}
                >
                  {current && (
                    <motion.span
                      layoutId="faq-topic-current"
                      aria-hidden
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-0 rounded-full border border-accent-line bg-[image:var(--surface-choice-selected)] shadow-[var(--shadow-choice-selected)]"
                    />
                  )}
                  <Icon
                    aria-hidden
                    className={cn(
                      "relative size-3.5 transition-colors duration-300",
                      current ? "text-accent-strong" : "text-faint group-hover:text-orange-strong",
                    )}
                  />
                  <span className="relative">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </motion.nav>
    </div>
  );
}

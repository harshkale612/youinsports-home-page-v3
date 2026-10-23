"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "motion/react";
import { ArrowUpRight, MessageCircleQuestion, Play } from "lucide-react";
import { Container } from "@/components/ui/Primitives";
import { FaqItem } from "@/features/faq/FaqItem";
import {
  PANEL_DURATION,
  afterFold,
  closeEntry,
  foldsAbove,
  isModified,
  scrollBehavior,
  scrollToRest,
} from "@/features/faq/navigation";
import { FAQ_TOPICS, TOPIC_IDS, type FaqTopic } from "@/features/faq/topics";
import { CONTACT_PATH, FAQ_ENTRY_IDS } from "@/data/faq";
import { readHash, replaceHash, useLocationHash } from "@/hooks/useLocationHash";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
};

/**
 * Every question, topic by topic, top to bottom, with the topics as a
 * column beside them on wide screens: it rides along as the reader scrolls,
 * marks the topic being read, and fills a rail in the logo's colours as the
 * reader works down the page. On phones the same topics are a sticky row of
 * pills instead.
 *
 * Which answer is open follows the URL's hash (see `navigation.ts`).
 */
export function FaqExplorer() {
  const hash = useLocationHash();
  const expanded = FAQ_ENTRY_IDS.has(hash) ? hash : null;
  const active = useActiveTopic();
  const listRef = useRef<HTMLDivElement>(null);

  // Links in: an entry's hash brings its answer into view, and a topic's
  // brings its section — on arrival, and whenever the hash changes from
  // outside (the address bar, a link). The page's own controls change the
  // hash with `replaceHash`, which fires no `hashchange`, so they never
  // scroll the page from under the reader.
  useEffect(() => {
    let cancel = () => {};

    function bringIntoView(previousId?: string) {
      const id = readHash();
      if (!FAQ_ENTRY_IDS.has(id) && !TOPIC_IDS.has(id)) return;
      const target = document.getElementById(id);
      if (!target) return;
      cancel();
      if (previousId && foldsAbove(previousId, id)) {
        cancel = afterFold(previousId, () => scrollToRest(target));
      } else {
        const timer = window.setTimeout(() => scrollToRest(target), 60);
        cancel = () => window.clearTimeout(timer);
      }
    }

    function onHashChange(event: HashChangeEvent) {
      bringIntoView(new URL(event.oldURL).hash.slice(1));
    }

    bringIntoView();
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancel();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  function toggle(id: string) {
    if (expanded === id) {
      closeEntry();
      return;
    }
    if (expanded && foldsAbove(expanded, id)) holdInPlace(id, expanded);
    // In place: the row is already where the reader is looking.
    replaceHash(id);
    trackEvent("faq_question_opened", { id });
  }

  return (
    <section
      id="answers"
      aria-labelledby="answers-heading"
      className="relative scroll-mt-20 py-[calc(var(--section-y)*0.8)] [overflow-anchor:none]"
    >
      <Container className="max-w-[80rem]">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            {...reveal}
            transition={{ duration: 0.7, ease }}
            className="font-display text-[0.68rem] font-semibold tracking-[0.3em] text-accent uppercase"
          >
            Questions &amp; answers
          </motion.p>
          <motion.h2
            id="answers-heading"
            {...reveal}
            transition={{ duration: 0.9, ease, delay: 0.08 }}
            className="display-lg mt-5 text-balance text-fg"
          >
            Answers, by <span className="text-brand">topic</span>
            <span className="text-accent">.</span>
          </motion.h2>
        </div>

        <TopicBar active={active} />

        <div className="mt-8 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,18.5rem)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <TopicColumn active={active} listRef={listRef} />

          <div ref={listRef} className="flex min-w-0 flex-col gap-16 md:gap-20">
            {FAQ_TOPICS.map((topic) => (
              <TopicSection key={topic.id} topic={topic} expanded={expanded} onToggle={toggle} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * The topics as a column beside the questions (wide screens). The topic
 * being read wears the logo's colours, which slide from row to row; the rail
 * through the marks fills as the reader works down the page. Under the list,
 * a way to ask about anything the answers miss.
 */
function TopicColumn({ active, listRef }: { active: string; listRef: React.RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 33%", "end 66%"] });
  const index = FAQ_TOPICS.findIndex((t) => t.id === active);

  return (
    <aside className="hidden lg:block">
      <motion.nav
        aria-label="FAQ topics"
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        className="sticky top-28"
      >
        <div className="relative overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 shadow-[var(--shadow-card)] backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-20 size-60 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/calc(0.16*var(--glow))),transparent_65%)]"
          />

          <div className="relative flex items-center justify-between px-3 pt-2 pb-4">
            <p className="font-display text-[0.62rem] font-semibold tracking-[0.24em] text-faint uppercase">Topics</p>
            <p className="tabular font-display text-[0.7rem] font-semibold text-faint" aria-hidden>
              <span className="text-fg">{String(index + 1).padStart(2, "0")}</span> /{" "}
              {String(FAQ_TOPICS.length).padStart(2, "0")}
            </p>
          </div>

          <ul className="relative flex flex-col gap-1">
            {/* The rail through the marks, filling with the reader's progress. */}
            <span aria-hidden className="absolute top-7 bottom-7 left-[29px] w-0.5 rounded-full bg-tint/[0.08]">
              <motion.span
                style={{ scaleY: scrollYProgress }}
                className="absolute inset-0 origin-top rounded-full bg-gradient-to-b from-[var(--brand-orange)] via-[var(--brand-orange)] to-[var(--brand-blue)] shadow-[0_0_8px_rgb(var(--orange-rgb)/calc(0.6*var(--glow)))]"
              />
            </span>

            {FAQ_TOPICS.map(({ id, category, icon: Icon, questions }) => {
              const current = id === active;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(event) => jumpTo(event, id)}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors duration-300",
                      !current && "hover:bg-tint/[0.04]",
                    )}
                  >
                    {current && (
                      <motion.span
                        layoutId="faq-column-current"
                        aria-hidden
                        transition={{ type: "spring", stiffness: 400, damping: 36 }}
                        className="glass-brand absolute inset-0 rounded-2xl"
                      />
                    )}
                    <span
                      className={cn(
                        "relative flex size-9 shrink-0 items-center justify-center rounded-xl border transition-[background,color,box-shadow,border-color] duration-500",
                        current
                          ? "border-transparent bg-[linear-gradient(135deg,var(--brand-orange),var(--brand-blue))] text-white shadow-[0_8px_18px_-8px_rgb(var(--orange-rgb)/calc(0.8*var(--glow)))]"
                          : "border-tint/10 bg-panel text-accent-strong group-hover:text-orange-strong",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "relative min-w-0 flex-1 font-display text-[0.92rem] leading-tight font-semibold transition-colors duration-300",
                        current ? "text-fg" : "text-fg/70 group-hover:text-fg",
                      )}
                    >
                      {category}
                    </span>
                    <span
                      className={cn(
                        "tabular relative flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[0.7rem] font-semibold transition-colors duration-300",
                        current ? "bg-accent-soft text-accent-strong" : "text-faint",
                      )}
                    >
                      {questions.length}
                      <span className="sr-only"> questions</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Inset like the rows above, so its text lines up with their marks. */}
          <div className="relative mt-3 rounded-2xl border border-tint/[0.07] bg-tint/[0.025] px-3 py-4">
            <div className="flex items-center gap-2.5">
              <MessageCircleQuestion className="size-4 text-orange-strong" aria-hidden />
              <p className="font-display text-[0.9rem] font-semibold text-fg">Can’t find your answer?</p>
            </div>
            <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">Ask the team directly and we’ll help.</p>
            <a
              href={CONTACT_PATH}
              onClick={() => trackEvent("faq_cta_clicked", { target: "topic-column" })}
              className="group mt-3 inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-accent-strong"
            >
              Email support
              <ArrowUpRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </motion.nav>
    </aside>
  );
}

/**
 * The topics as a sticky row of pills (phones and tablets, where there's no
 * room for the column). It rides just under the site bar, marks the topic
 * being read, and keeps that pill in view as the row scrolls sideways.
 */
function TopicBar({ active }: { active: string }) {
  const scrollerRef = useRef<HTMLUListElement>(null);

  // Only the row scrolls: `scrollIntoView` would reach the page too and
  // could cut short a glide the reader started.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const pill = scroller?.querySelector<HTMLElement>(`[data-topic="${active}"]`);
    if (!scroller || !pill || scroller.scrollWidth <= scroller.clientWidth) return;
    scroller.scrollTo({
      left: pill.offsetLeft - (scroller.clientWidth - pill.offsetWidth) / 2,
      behavior: scrollBehavior(),
    });
  }, [active]);

  return (
    <div className="pointer-events-none sticky top-[5.5rem] z-30 mt-10 flex justify-center lg:hidden">
      <nav
        aria-label="FAQ topics"
        className="pointer-events-auto relative w-max max-w-full rounded-full border border-[var(--glass-border)] bg-popover p-1.5 shadow-[var(--shadow-popover)] backdrop-blur-xl"
      >
        <span aria-hidden className="rule-brand absolute inset-x-10 top-0 opacity-70" />
        <ul
          ref={scrollerRef}
          className="hide-scrollbar flex gap-1 overflow-x-auto rounded-full [mask-image:linear-gradient(90deg,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)]"
        >
          {FAQ_TOPICS.map(({ id, category, icon: Icon }) => {
            const current = id === active;
            return (
              <li key={id} className="shrink-0">
                <a
                  href={`#${id}`}
                  data-topic={id}
                  onClick={(event) => jumpTo(event, id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-medium whitespace-nowrap transition-colors duration-300",
                    current ? "text-fg" : "text-muted",
                  )}
                >
                  {current && (
                    <motion.span
                      layoutId="faq-bar-current"
                      aria-hidden
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      className="absolute inset-0 rounded-full border border-accent-line bg-[image:var(--surface-choice-selected)] shadow-[var(--shadow-choice-selected)]"
                    />
                  )}
                  <Icon aria-hidden className={cn("relative size-3.5", current ? "text-accent-strong" : "text-faint")} />
                  <span className="relative">{category}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/**
 * One topic: its mark, name, what it covers and how much is in it, then its
 * questions. The rows rise in one after another as the section arrives.
 */
function TopicSection({
  topic,
  expanded,
  onToggle,
}: {
  topic: FaqTopic;
  expanded: string | null;
  onToggle: (id: string) => void;
}) {
  const { id, icon: Icon, category, summary, questions, videoCount } = topic;
  const number = FAQ_TOPICS.indexOf(topic) + 1;

  return (
    // Focusable so the topic links can hand focus to it; it is never tabbed
    // to. The scroll margin clears the site bar (and the pill row on phones).
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-40 outline-none! lg:scroll-mt-28"
    >
      <motion.header
        {...reveal}
        transition={{ duration: 0.8, ease }}
        className="mb-6 flex items-start gap-4 md:mb-7 md:gap-5"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-orange),var(--brand-blue))] text-white shadow-[0_14px_30px_-12px_rgb(var(--orange-rgb)/calc(0.7*var(--glow)))] md:size-14">
          <Icon className="size-5 md:size-6" aria-hidden />
        </span>
        <div className="min-w-0">
          {/* Every item leads with a dot, and the row starts a dot's width
              outside the clip, so the dot that opens a line (the first
              included) is never seen: a narrow screen wraps without leaving
              a dot at either end of a line. */}
          <p className="tabular overflow-hidden font-display text-[0.62rem] font-semibold tracking-[0.2em] text-faint uppercase">
            <span className="-ml-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <MetaItem>
                Topic {String(number).padStart(2, "0")} / {String(FAQ_TOPICS.length).padStart(2, "0")}
              </MetaItem>
              <MetaItem>{questions.length} questions</MetaItem>
              {videoCount > 0 && (
                <MetaItem className="text-orange-strong">
                  <span className="flex items-center gap-1">
                    <Play className="size-2.5 fill-current" aria-hidden />
                    {videoCount} with video
                  </span>
                </MetaItem>
              )}
            </span>
          </p>
          <h3
            id={`${id}-heading`}
            className="mt-2 font-display text-[1.6rem] leading-tight font-semibold tracking-[-0.025em] text-fg md:text-[1.9rem]"
          >
            {category}
          </h3>
          <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-pretty text-muted">{summary}</p>
        </div>
      </motion.header>

      <motion.ul
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-8% 0px" }}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
        className="divide-y divide-tint/[0.07] overflow-hidden rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[var(--shadow-card)] backdrop-blur-xl"
      >
        {questions.map((entry, i) => (
          <FaqItem key={entry.id} entry={entry} index={i} open={expanded === entry.id} onToggle={onToggle} />
        ))}
      </motion.ul>
    </section>
  );
}

/** One fact in a topic's header line, after its separating dot. */
function MetaItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span aria-hidden className="size-1 shrink-0 rounded-full bg-tint/20" />
      {children}
    </span>
  );
}

/**
 * Glides to a topic's section rather than jumping, and leaves the hash
 * alone: the hash belongs to the open answer. A modified click still opens
 * the anchor the browser's own way (a new tab, say).
 */
function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  if (isModified(event)) return;
  const section = document.getElementById(id);
  if (!section) return;
  event.preventDefault();
  scrollToRest(section);
  section.focus({ preventScroll: true });
  trackEvent("faq_topic_selected", { id });
}

/**
 * The topic being read: the last one whose top has passed a line a third of
 * the way down the screen (the first, before any has). Read from the layout
 * at most once a frame, whenever the page scrolls or resizes or a section
 * changes size (an answer opening moves everything below it).
 */
function useActiveTopic() {
  const [active, setActive] = useState(FAQ_TOPICS[0].id);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current = FAQ_TOPICS[0].id;
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

"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, CirclePlay, Link2 } from "lucide-react";
import type { FaqEntry } from "@/data/faq";
import { PANEL_DURATION, answerPanelId } from "@/features/faq/navigation";
import { hasVideo } from "@/features/faq/topics";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * One question, as a row of its topic's panel that opens onto the answer.
 *
 * The open row lights from its left edge, where a rule in the logo's colours
 * runs down beside it. The answer stays in the page while it's closed (folded
 * to nothing and inert), so it's in the server's HTML for search engines;
 * its video is the exception, and only mounts while the row is open.
 */
export function FaqItem({
  entry,
  index,
  open,
  onToggle,
}: {
  entry: FaqEntry;
  index: number;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const questionId = `${entry.id}-question`;
  const answerId = answerPanelId(entry.id);
  const videoId = hasVideo(entry) ? entry.videoId : undefined;

  return (
    // Rises in with its siblings when its topic's panel is shown (the panel
    // drives the `hidden`/`shown` variants).
    <motion.li
      id={entry.id}
      variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.6, ease }}
      // The scroll margin clears the site bar (and the topic pill row on phones).
      className="group/item relative scroll-mt-40 lg:scroll-mt-28"
    >
      {/* The open row's light and its rule. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--accent-rgb)/0.08),transparent_65%)] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top bg-gradient-to-b from-orange via-orange/60 to-accent transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "scale-y-100" : "scale-y-0",
        )}
      />

      <h4 className="relative">
        <button
          id={questionId}
          type="button"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => onToggle(entry.id)}
          // The panel clips its corners, so the focus ring is drawn inside.
          className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-colors duration-300 hover:bg-tint/[0.025] focus-visible:rounded-2xl! focus-visible:-outline-offset-4! md:gap-5 md:px-7 md:py-6"
        >
          <span
            aria-hidden
            className={cn(
              "tabular hidden w-6 shrink-0 font-display text-xs font-semibold transition-colors duration-300 sm:block",
              open ? "text-orange-strong" : "text-faint",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={cn(
              "min-w-0 flex-1 font-display text-[1.02rem] leading-snug font-semibold tracking-[-0.01em] text-pretty transition-colors duration-300 md:text-[1.1rem]",
              open ? "text-fg" : "text-fg/85 group-hover/item:text-fg",
            )}
          >
            {entry.question}
          </span>
          {videoId && <VideoBadge hidden={open} />}
          <Toggle open={open} />
        </button>
      </h4>

      <motion.div
        id={answerId}
        role="region"
        aria-labelledby={questionId}
        inert={!open}
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{
          height: { duration: PANEL_DURATION, ease },
          opacity: open ? { duration: 0.45, ease, delay: 0.08 } : { duration: 0.25, ease },
        }}
        className="relative overflow-hidden"
      >
        {/* Indented under the question text, past the row number: the row's
            padding, the number's w-6 and the gap after it. */}
        <div className="px-5 pb-7 sm:pl-[3.75rem] md:pr-7 md:pb-8 md:pl-[4.5rem]">
          <p className="max-w-[62ch] text-[0.98rem] leading-[1.8] text-pretty text-muted">{entry.answer}</p>

          <AnimatePresence>
            {open && videoId && <VideoEmbed key={videoId} videoId={videoId} question={entry.question} />}
          </AnimatePresence>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-tint/[0.07] bg-tint/[0.03] px-2.5 py-1 text-[0.72rem] font-medium text-muted"
                >
                  <span aria-hidden className="text-faint">
                    #
                  </span>
                  {tag}
                </li>
              ))}
            </ul>
            <CopyLink id={entry.id} />
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
}

/** "▶ Video", for entries with a walkthrough. It steps aside once the video itself is showing. */
function VideoBadge({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden={hidden}
      className={cn(
        "hidden shrink-0 items-center gap-1 rounded-full bg-orange-soft py-1 pr-2.5 pl-1.5 text-orange-strong transition-opacity duration-200 sm:flex",
        hidden && "opacity-0",
      )}
    >
      <CirclePlay className="size-4" aria-hidden />
      <span className="text-[0.7rem] font-semibold">Video</span>
    </span>
  );
}

/** A plus that turns into a cross as its circle fills with the brand blue. */
function Toggle({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,box-shadow,rotate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        open
          ? "rotate-45 border-transparent bg-accent text-white shadow-[0_8px_20px_-8px_rgb(var(--accent-rgb)/calc(0.9*var(--glow)))]"
          : "border-tint/10 bg-tint/[0.03] text-accent-strong group-hover/item:border-accent-line group-hover/item:bg-accent-soft",
      )}
    >
      <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
      <span className="absolute h-3.5 w-0.5 rounded-full bg-current" />
    </span>
  );
}

/** Copies a link straight to this answer, for sharing. */
function CopyLink({ id }: { id: string }) {
  const { state, copy } = useCopyToClipboard();
  const copied = state === "copied";

  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        if (await copy(url)) trackEvent("faq_link_copied", { id });
      }}
      // The negative margin lines the label up with the toggle above it.
      className="-mr-2 ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.75rem] font-medium text-faint transition-colors duration-200 hover:text-fg"
    >
      {copied ? <Check className="size-3.5 text-accent-strong" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : state === "failed" ? "Couldn't copy" : "Copy link"}</span>
    </button>
  );
}

/** The entry's walkthrough, fading in under the answer once it opens. */
function VideoEmbed({ videoId, question }: { videoId: string; question: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.8, ease, delay: 0.15 }}
      className="relative mt-6 aspect-video max-w-2xl overflow-hidden rounded-2xl border border-accent/15 bg-tag shadow-[0_18px_40px_-18px_rgb(var(--accent-rgb)/0.35)]"
    >
      {/* Shown until the player paints over it. */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center text-faint">
        <CirclePlay className="size-10 animate-pulse" strokeWidth={1.25} />
      </div>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=0`}
        title={`Video: ${question}`}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </motion.div>
  );
}

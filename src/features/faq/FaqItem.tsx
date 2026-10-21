"use client";

import { AnimatePresence, motion } from "motion/react";
import { CirclePlay } from "lucide-react";
import type { FaqEntry } from "@/data/faq";
import { PANEL_DURATION, answerPanelId } from "@/features/faq/navigation";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * One question, as a card that opens onto its answer.
 *
 * The answer stays in the page while it's closed (folded to nothing and
 * inert), so it's in the server's HTML for search engines. Its video is the
 * exception: the player only mounts while the entry is open.
 */
export function FaqItem({
  entry,
  open,
  onToggle,
}: {
  entry: FaqEntry;
  open: boolean;
  onToggle: (id: string) => void;
}) {
  const questionId = `${entry.id}-question`;
  const answerId = answerPanelId(entry.id);
  const videoId = entry.hasVideo ? entry.videoId : undefined;

  return (
    <div
      id={entry.id}
      className={cn(
        "group/item relative scroll-mt-40 overflow-hidden rounded-xl border backdrop-blur-[10px] transition-[border-color,box-shadow,background-color] duration-300",
        open
          ? "border-accent/40 bg-panel shadow-[0_10px_30px_-10px_rgb(var(--accent-rgb)/0.15)]"
          : "border-tint/5 bg-[var(--glass-bg)] shadow-[var(--shadow-tile)] hover:border-accent/20",
      )}
    >
      {/* Light falling on the open card from its corner. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-32 -right-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(var(--accent-rgb)/calc(0.16*var(--glow))),transparent_65%)] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <h3 className="relative">
        <button
          id={questionId}
          type="button"
          aria-expanded={open}
          aria-controls={answerId}
          onClick={() => onToggle(entry.id)}
          // The card clips its corners, so the focus ring is drawn inside.
          className="flex min-h-12 w-full cursor-pointer items-center gap-4 px-5 py-3 text-left focus-visible:rounded-xl! focus-visible:-outline-offset-4! md:px-8 md:py-4"
        >
          <span
            className={cn(
              "min-w-0 flex-1 font-display text-base leading-snug transition-colors duration-300 md:text-lg",
              open ? "font-bold text-fg" : "font-semibold text-fg/80",
            )}
          >
            {entry.question}
          </span>
          {videoId && <VideoBadge hidden={open} />}
          <Toggle open={open} />
        </button>
      </h3>

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
        <div className="px-5 pb-6 md:px-8 md:pb-8">
          <p className="text-base leading-[1.8] text-pretty text-muted">{entry.answer}</p>

          <AnimatePresence>
            {open && videoId && <VideoEmbed key={videoId} videoId={videoId} question={entry.question} />}
          </AnimatePresence>

          <ul aria-label="Tags" className="mt-6 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex h-6 items-center rounded-[6px] border border-tint/[0.06] bg-tint/[0.03] px-2 text-xs font-medium text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

/** "▶ Video", for entries with a walkthrough. It steps aside once the video itself is showing. */
function VideoBadge({ hidden }: { hidden: boolean }) {
  return (
    <span
      aria-hidden={hidden}
      className={cn(
        "hidden shrink-0 items-center gap-1 rounded-full bg-orange-soft py-1 pr-2.5 pl-1.5 text-orange transition-opacity duration-200 sm:flex",
        hidden && "opacity-0",
      )}
    >
      <CirclePlay className="size-[18px]" aria-hidden />
      <span className="text-xs font-semibold">Video</span>
    </span>
  );
}

/** A plus that folds into a minus as its circle fills with the brand blue. */
function Toggle({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full transition-[background-color,color,box-shadow] duration-300",
        open
          ? "bg-accent text-white shadow-[0_6px_16px_-6px_rgb(var(--accent-rgb)/calc(0.9*var(--glow)))]"
          : "bg-accent/10 text-accent group-hover/item:bg-accent/15",
      )}
    >
      <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
      <span
        className={cn(
          "absolute h-3.5 w-0.5 rounded-full bg-current transition-[rotate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open && "rotate-90",
        )}
      />
    </span>
  );
}

/** The entry's walkthrough, fading in under the answer once it opens. */
function VideoEmbed({ videoId, question }: { videoId: string; question: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ duration: 0.8, ease, delay: 0.15 }}
      className="relative mt-6 mb-2 aspect-video overflow-hidden rounded border border-accent/15 bg-tag shadow-[0_10px_30px_-10px_rgb(var(--accent-rgb)/0.2)]"
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

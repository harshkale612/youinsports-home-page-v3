import { cn } from "@/lib/utils";

/**
 * The name, in the logo's colours: "You" orange, "In" blue. "Sports" is navy in
 * the logo, which has no contrast on the dark theme, so there it takes the text
 * colour; in daylight it's the logo's own navy.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-[var(--wordmark-you)]">You</span>
      <span className="text-[var(--wordmark-in)]">In</span>
      <span className="text-[var(--wordmark-sports)]">Sports</span>
    </span>
  );
}

/** Small uppercase label that opens a section. */
export function SectionLabel({
  className,
  index,
  children,
  ...props
}: React.ComponentProps<"p"> & { index?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-display text-[0.68rem] font-semibold tracking-[0.3em] text-orange uppercase",
        className,
      )}
      {...props}
    >
      {index && <span className="tabular text-faint">{index}</span>}
      <span className="h-px w-10 bg-gradient-to-r from-orange to-transparent" aria-hidden />
      {children}
    </p>
  );
}

export function DisplayText({
  className,
  as: Tag = "h2",
  size = "lg",
  ...props
}: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" | "p"; size?: "xl" | "lg" | "md" }) {
  return (
    <Tag
      className={cn(
        size === "xl" ? "display-xl" : size === "lg" ? "display-lg" : "display-md",
        "text-balance text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function BodyText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-pretty text-base leading-relaxed text-muted md:text-lg", className)}
      {...props}
    />
  );
}

/**
 * Translucent surface used for floating data and athlete panels.
 * Used sparingly and always over the globe — never as a general page surface.
 */
export function GlassPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

/** A single editorial statistic. */
export function Metric({
  value,
  label,
  className,
  align = "left",
}: {
  value: string;
  label: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <p className="tabular font-display text-[clamp(1.6rem,3vw,2.6rem)] leading-none font-semibold tracking-tight text-fg">
        {value}
      </p>
      <p className="mt-2 font-display text-[0.62rem] font-semibold tracking-[0.22em] text-muted uppercase">
        {label}
      </p>
    </div>
  );
}

/** Marks illustrative figures as what they are, everywhere they appear. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-orange/25 bg-orange-soft/50 px-2.5 py-1",
        "font-display text-[0.55rem] font-semibold tracking-[0.2em] text-faint uppercase",
        className,
      )}
    >
      <span className="size-1 rounded-full bg-orange shadow-[0_0_6px_rgb(var(--orange-rgb)/var(--glow))]" aria-hidden />
      Demo network
    </span>
  );
}

export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[96rem] px-6 md:px-10 lg:px-14", className)}
      {...props}
    />
  );
}

import { cn } from "@/lib/utils";

export function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 font-display text-xs font-semibold tracking-[0.28em] text-orange uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function DisplayHeading({
  className,
  as: Tag = "h2",
  ...props
}: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) {
  return (
    <Tag
      className={cn(
        "text-balance font-display font-semibold leading-[0.95] tracking-tight text-fg",
        className,
      )}
      {...props}
    />
  );
}

export function BodyText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-balance text-base leading-relaxed text-muted md:text-lg", className)}
      {...props}
    />
  );
}

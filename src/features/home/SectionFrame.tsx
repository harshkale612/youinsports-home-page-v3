import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Primitives";

type Align = "left" | "right" | "center" | "wide";

const ALIGNMENT: Record<Align, string> = {
  left: "items-start",
  right: "items-end text-left",
  center: "items-center text-center",
  wide: "items-stretch",
};

const COLUMN: Record<Align, string> = {
  left: "max-w-lg lg:max-w-xl xl:max-w-[42rem]",
  right: "max-w-lg lg:max-w-xl xl:max-w-[42rem]",
  center: "max-w-3xl",
  wide: "w-full",
};

/**
 * Shared shell for every scroll act.
 *
 * Each section is a full viewport tall so the globe's framing for that act has
 * room to resolve, and carries its own scrim — the copy sits directly over a
 * live WebGL scene, so legibility can't be left to chance. The scrim is laid in
 * `veil`, the theme's page colour at the theme's strength: dense at night,
 * light by day, where the planet under wide copy is drawn day-side.
 */
export function SectionFrame({
  id,
  align = "left",
  className,
  scrim = true,
  children,
}: {
  id: string;
  align?: Align;
  className?: string;
  scrim?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("relative flex min-h-svh flex-col justify-center py-24", className)}
    >
      {scrim && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0",
            align === "left" && "bg-gradient-to-b from-veil/70 via-veil/35 to-veil/70 md:bg-gradient-to-r md:from-veil-side/92 md:via-veil-side/45 md:to-transparent",
            align === "right" && "bg-gradient-to-b from-veil/70 via-veil/35 to-veil/70 md:bg-gradient-to-l md:from-veil-side/92 md:via-veil-side/45 md:to-transparent",
            align === "center" && "bg-gradient-to-b from-veil/92 via-veil/25 to-veil/92",
            // `wide` runs content across the full column width, directly over
            // the lit side of the globe — it needs a denser floor than the
            // single-column alignments, which only ever cover one half.
            align === "wide" && "bg-gradient-to-b from-veil/94 via-veil/72 to-veil/96",
          )}
        />
      )}

      <Container className={cn("relative flex flex-col", ALIGNMENT[align])}>
        <div className={COLUMN[align]}>{children}</div>
      </Container>
    </section>
  );
}

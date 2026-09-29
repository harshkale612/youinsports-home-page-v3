import Link from "next/link";
import { Container, Wordmark } from "@/components/ui/Primitives";

const GROUPS = [
  {
    title: "Explore",
    links: [
      { label: "Athletes", href: "/#athletes" },
      { label: "Sports", href: "/#sports" },
      { label: "Rankings", href: "/#rankings" },
      { label: "Opportunities", href: "/#opportunities" },
    ],
  },
  {
    title: "Platform",
    links: [{ label: "About", href: "/about" }],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "mailto:hello@youinsports.ai" },
    ],
  },
];

/**
 * The site footer. Dark in both themes, on purpose: a light page closes on the
 * same night the dark one lives in — the horizon planets on the About and
 * coming-soon pages rise straight into it — so `data-theme` pins it.
 */
export function Footer() {
  return (
    <footer
      data-theme="dark"
      className="relative z-10 overflow-hidden bg-[linear-gradient(180deg,var(--color-void),var(--color-bg)_60%,#071a27)] py-14"
    >
      <span aria-hidden className="rule-brand absolute inset-x-0 top-0" />
      {/* The globe's orange sunrise, echoed once more at the very bottom. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -bottom-72 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(240_107_40/0.14),transparent_65%)]"
      />
      <Container className="relative">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-sm font-bold tracking-[0.22em] uppercase">
              <Wordmark />
            </p>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-muted">
              A global stage for athletes to build their identity, improve their game and
              discover what&apos;s next.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-9 sm:grid-cols-3 md:gap-x-16" aria-label="Footer">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="font-display text-[0.58rem] font-semibold tracking-[0.22em] text-accent-strong/80 uppercase">
                  {group.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.86rem] text-muted transition-colors hover:text-orange-strong"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-tint/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.76rem] text-faint">
            &copy; {new Date().getFullYear()} YouInSports. All rights reserved.
          </p>
          <p className="text-[0.76rem] text-faint">
            Athlete data shown across this site is illustrative demo data.
          </p>
        </div>
      </Container>
    </footer>
  );
}

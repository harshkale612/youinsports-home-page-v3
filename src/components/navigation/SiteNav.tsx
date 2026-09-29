"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui/Primitives";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Merchandise", href: "/merchandise" },
  { label: "YouInSports Foundation", href: "/foundation" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

/**
 * The site-wide bar.
 *
 * `fixed` floats over the page and frosts once it moves — the homepage, where
 * the bar should never compete with the planet. `static` sits in the flow and
 * scrolls away, so a product page's own bar can take the top of the viewport.
 *
 * The links stay put on desktop and fold into a menu below that, which leaves
 * the middle of the bar free for `status`. The theme toggle never folds away:
 * it sits with the other controls at every width.
 */
export function SiteNav({
  position = "fixed",
  status,
  actions,
  onSearch,
}: {
  position?: "fixed" | "static";
  /** Shown in the middle of the bar below `lg`, where the links have folded away. */
  status?: React.ReactNode;
  /** Extra buttons, placed before the menu toggle. */
  actions?: React.ReactNode;
  /** Shows the search button when provided. */
  onSearch?: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (position !== "fixed") return;
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [position]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-50",
        position === "fixed"
          ? "fixed transition-[background-color,border-color,backdrop-filter] duration-500"
          : "relative",
        position === "fixed" && scrolled
          ? "border-b border-[var(--glass-border)] bg-nav backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-3 px-6 py-5 max-[359px]:px-4 sm:gap-6 md:px-10 lg:px-14">
        <Link
          href="/"
          className="font-display text-[0.82rem] font-bold tracking-[0.22em] uppercase"
          aria-label="YouInSports"
        >
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-9">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "text-[0.82rem] whitespace-nowrap transition-colors duration-200 hover:text-fg",
                isActive(link.href)
                  ? // The indicator is the theme's to show: daylight marks the
                    // current page with a short orange rule, the night bar
                    // lets the brighter text do it.
                    "relative text-fg after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-3.5 after:-translate-x-1/2 after:rounded-full after:bg-[var(--nav-indicator)]"
                  : "text-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {status}

        <div className="flex items-center gap-1.5 min-[400px]:gap-2 md:gap-3">
          {onSearch && (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onSearch();
              }}
              aria-label="Search athletes, sports or countries"
              className="flex size-9 items-center justify-center rounded-full border border-tint/10 text-muted transition-colors hover:border-accent/60 hover:text-fg"
            >
              <Search className="size-4" aria-hidden />
            </button>
          )}

          {/* Below 360px there isn't room for every control once the bar
              carries an action, so the toggle moves into the menu. */}
          <ThemeToggle className="max-[359px]:hidden" />

          {actions}

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-full border border-tint/10 text-fg lg:hidden"
          >
            {menuOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease }}
            className="absolute inset-x-0 top-full border-t border-tint/[0.07] bg-menu backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col px-6 py-4 md:px-10" aria-label="Mobile">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "border-b border-tint/[0.06] py-4 font-display text-lg font-medium last:border-0",
                    isActive(link.href) ? "text-orange-strong" : "text-fg",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center justify-between border-t border-tint/[0.06] py-4 min-[360px]:hidden">
                <span className="font-display text-lg font-medium text-fg">Appearance</span>
                <ThemeToggle tooltipAlign="end" />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

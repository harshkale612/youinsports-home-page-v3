"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/ui/Primitives";
import { AnimatePresence, motion } from "motion/react";
import { Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalExperience } from "@/stores/globalExperienceStore";
import { trackEvent } from "@/lib/analytics";

const LINKS = [
  { label: "Athletes", href: "/#athletes" },
  { label: "Sports", href: "/#sports" },
  { label: "Opportunities", href: "/#opportunities" },
  { label: "Rankings", href: "/#rankings" },
  { label: "About", href: "/#ecosystem" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const setSearchOpen = useGlobalExperience((s) => s.setSearchOpen);

  // Transparent over the hero, frosted once the page moves — the bar should
  // never compete with the planet at rest.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
    trackEvent("search_opened");
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-white/[0.07] bg-[rgba(3,11,18,0.72)] backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-6 px-6 py-5 md:px-10 lg:px-14">
        <Link
          href="/"
          className="font-display text-[0.82rem] font-bold tracking-[0.22em] uppercase"
          aria-label="YouInSports"
        >
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.82rem] text-muted transition-colors duration-200 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={openSearch}
            aria-label="Search athletes, sports or countries"
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-muted transition-colors hover:border-accent/60 hover:text-fg"
          >
            <Search className="size-4" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 text-fg lg:hidden"
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
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.07] bg-[rgba(3,11,18,0.96)] backdrop-blur-xl lg:hidden"
          >
            <nav className="flex flex-col px-6 py-4" aria-label="Mobile">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-white/[0.06] py-4 font-display text-lg font-medium text-fg last:border-0"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

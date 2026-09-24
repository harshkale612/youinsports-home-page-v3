"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { motion, type HTMLMotionProps } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MagneticWrapper } from "@/components/ui/MagneticWrapper";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-cta text-ink hover:-translate-y-px",
  secondary:
    "border border-border-strong bg-[var(--glass-bg)] text-fg backdrop-blur-md hover:border-accent/70 hover:bg-accent-soft",
  ghost: "text-muted hover:text-fg",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[0.7rem] tracking-[0.12em]",
  md: "px-6 py-3 text-xs tracking-[0.14em]",
  lg: "px-8 py-4 text-[0.8rem] tracking-[0.14em]",
};

const BASE =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full font-display font-semibold uppercase transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40";

const ARROW =
  "size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5";

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  magnetic?: boolean;
  showArrow?: boolean;
};

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> &
  SharedProps & { children?: React.ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", magnetic = false, showArrow = false, children, ...props },
  ref,
) {
  const button = (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    >
      {children}
      {showArrow && <ArrowRight className={ARROW} aria-hidden />}
    </motion.button>
  );

  return magnetic ? <MagneticWrapper>{button}</MagneticWrapper> : button;
});

/** Same visual language as {@link Button}, but a real anchor for real routes. */
export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  magnetic = false,
  showArrow = false,
  children,
  ...props
}: SharedProps &
  Omit<React.ComponentProps<typeof Link>, "href"> & { href: string; children: React.ReactNode }) {
  const link = (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props}>
      {children}
      {showArrow && <ArrowRight className={ARROW} aria-hidden />}
    </Link>
  );

  return magnetic ? <MagneticWrapper>{link}</MagneticWrapper> : link;
}

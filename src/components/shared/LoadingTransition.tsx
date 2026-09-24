"use client";

import { motion } from "motion/react";

export function LoadingTransition({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full max-w-xl flex-col items-start gap-4"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
        </span>
        <p className="font-display text-sm font-semibold tracking-[0.2em] text-fg uppercase">
          {label}
        </p>
      </div>
      <div className="h-px w-full overflow-hidden bg-white/[0.06]">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-orange"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

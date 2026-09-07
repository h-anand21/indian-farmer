import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  /** Unique key for AnimatePresence (use route path) */
  pageKey?: string;
  /** Animation variant */
  variant?: "fade" | "slideUp" | "slideLeft";
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: "easeInOut" as const },
  },
  slideUp: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
  slideLeft: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/**
 * PageTransition — Wraps page content with Framer Motion animations.
 * Provides consistent entrance/exit transitions across the app.
 */
export function PageTransition({
  children,
  pageKey = "page",
  variant = "slideUp",
}: PageTransitionProps) {
  const v = variants[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={v.transition as any}
        style={{ width: "100%", minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;

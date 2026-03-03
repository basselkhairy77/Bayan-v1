import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** vertical offset in px to rise from */
  y?: number;
  /** animation duration in seconds */
  duration?: number;
}

/**
 * Wraps content in a smooth fade + lift animation.
 * Use `delay` to stagger multiple FadeIn elements on a page.
 */
export function FadeIn({
  children,
  delay = 0,
  className = "",
  y = 20,
  duration = 0.55,
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

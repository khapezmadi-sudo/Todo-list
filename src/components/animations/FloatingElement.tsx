import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export const FloatingElement = ({
  children,
  className = "",
  delay = 0,
  duration = 3,
  yOffset = 8,
}: FloatingElementProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

interface PulseElementProps {
  children: ReactNode;
  className?: string;
}

export const PulseElement = ({
  children,
  className = "",
}: PulseElementProps) => {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};

interface GlowElementProps {
  children: ReactNode;
  className?: string;
  color?: string;
}

export const GlowElement = ({
  children,
  className = "",
  color = "primary",
}: GlowElementProps) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: `0 0 30px 5px var(--${color})`,
        transition: { duration: 0.3 },
      }}
    >
      {children}
    </motion.div>
  );
};

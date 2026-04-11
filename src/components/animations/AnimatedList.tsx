import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export const AnimatedList = ({
  children,
  className = "",
}: AnimatedListProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedListItem = ({
  children,
  className = "",
}: AnimatedListItemProps) => {
  return (
    <motion.div variants={itemVariants} className={className} layout>
      {children}
    </motion.div>
  );
};

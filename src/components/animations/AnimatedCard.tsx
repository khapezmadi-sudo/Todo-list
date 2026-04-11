import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  index?: number;
}

const cardVariants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: custom * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut" as const,
    },
  },
};

export const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  index = 0,
}: AnimatedCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={delay + index}
      className={className}
    >
      {children}
    </motion.div>
  );
};

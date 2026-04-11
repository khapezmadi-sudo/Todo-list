import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
}

const buttonVariants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeOut" as const,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
  loading: {
    scale: [1, 0.98, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const shimmerVariants = {
  initial: {
    x: "-100%",
  },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

export const AnimatedButton = ({
  children,
  className = "",
  isLoading = false,
  ...props
}: AnimatedButtonProps) => {
  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={isLoading ? undefined : "hover"}
      whileTap={isLoading ? undefined : "tap"}
      animate={isLoading ? "loading" : undefined}
      className={`relative overflow-hidden px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      {isLoading && (
        <motion.div
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
        />
      )}
    </motion.button>
  );
};

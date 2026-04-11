import { motion } from "framer-motion";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const checkVariants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
  exit: {
    pathLength: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const boxVariants = {
  initial: {
    scale: 1,
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.9,
    transition: {
      duration: 0.1,
    },
  },
  checked: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3,
    },
  },
};

export const AnimatedCheckbox = ({
  checked,
  onChange,
  className = "",
}: AnimatedCheckboxProps) => {
  return (
    <motion.button
      type="button"
      onClick={onChange}
      className={`relative flex items-center justify-center w-6 h-6 rounded-md border-2 transition-colors ${
        checked
          ? "bg-primary border-primary"
          : "bg-background border-muted-foreground/30 hover:border-primary/50"
      } ${className}`}
      variants={boxVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={checked ? "checked" : "initial"}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="absolute"
      >
        <motion.path
          d="M3 7L6 10L11 4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={checkVariants}
          initial="initial"
          animate={checked ? "animate" : "exit"}
        />
      </svg>
    </motion.button>
  );
};

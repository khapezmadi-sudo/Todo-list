import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export const DailyProgress: React.FC = () => {
  const { t } = useTranslation();
  const [todayTasks, setTodayTasks] = useState<{ total: number; completed: number }>({
    total: 0,
    completed: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setTodayTasks({ total: 0, completed: 0 });
        return;
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

      const todayQuery = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        where("dueDate", ">=", Timestamp.fromDate(startOfToday)),
        where("dueDate", "<", Timestamp.fromDate(startOfTomorrow))
      );

      const unsubscribe = onSnapshot(todayQuery, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => doc.data());
        const total = tasks.length;
        const completed = tasks.filter((t) => t.completed).length;
        setTodayTasks({ total, completed });
        setIsVisible(total > 0);
      });

      return () => unsubscribe();
    });

    return () => unsubscribeAuth();
  }, []);

  const progress = todayTasks.total > 0 
    ? Math.round((todayTasks.completed / todayTasks.total) * 100) 
    : 0;

  const isAllDone = todayTasks.total > 0 && todayTasks.completed === todayTasks.total;

  // Don't show if no tasks for today
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "fixed bottom-4 right-4 z-50",
          "flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg",
          "border bg-card/95 backdrop-blur-sm",
          isAllDone ? "border-green-500/30 bg-green-50/95 dark:bg-green-950/30" : "border-border"
        )}
      >
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/30"
            />
            {/* Progress circle */}
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 20}`}
              initial={{ strokeDashoffset: `${2 * Math.PI * 20}` }}
              animate={{ 
                strokeDashoffset: `${2 * Math.PI * 20 * (1 - progress / 100)}` 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                isAllDone ? "text-green-500" : "text-primary"
              )}
            />
          </svg>
          
          {/* Center icon or percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isAllDone ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <span className="text-xs font-bold text-foreground">
                {progress}%
              </span>
            )}
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <Target className={cn(
              "w-3.5 h-3.5",
              isAllDone ? "text-green-500" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-xs font-medium",
              isAllDone ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}>
              {isAllDone ? t("dailyProgressAllDone") : t("dailyProgressTitle")}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {todayTasks.completed}/{todayTasks.total} {t("dailyProgressTasks")}
          </span>
        </div>

        {/* Celebration animation for all done */}
        {isAllDone && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 15 }}
            className="absolute -top-1 -right-1 w-4 h-4"
          >
            <span className="text-lg">🎉</span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

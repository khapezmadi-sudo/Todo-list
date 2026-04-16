import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task";
import { auth, db } from "@/firebase";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteTaskById } from "@/services/taskService";
import { Loading } from "@/components/shared/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  startOfDay,
  compareAsc,
} from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { ChevronDown, ChevronRight } from "lucide-react";

// Group tasks by due date
const groupTasksByDate = (tasks: Task[]) => {
  const groups: { [key: string]: Task[] } = {};

  tasks.forEach((task) => {
    if (!task.dueDate || !task.dueDate.toDate) {
      const key = "no-date";
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    } else {
      const date = task.dueDate.toDate();
      const dateKey = startOfDay(date).toISOString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(task);
    }
  });

  return groups;
};

// Get locale based on i18n language
const getLocale = (lang: string) => {
  switch (lang) {
    case "ru":
      return ru;
    case "kk":
      return kk;
    default:
      return enUS;
  }
};

export const CompletedPage = () => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const isLoading = tasks === null;
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);

  // Toggle group collapse state
  const toggleGroup = (dateKey: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dateKey)) {
        newSet.delete(dateKey);
      } else {
        newSet.add(dateKey);
      }
      return newSet;
    });
  };
  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Query completed tasks ordered by due date (newest first)
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("completed", "==", true),
          orderBy("dueDate", "desc"),
        );

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTasks(tasksData);
        });
      } else {
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);
  const handleToggleStatus = useCallback(async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);

    try {
      await updateDoc(taskRef, {
        completed: !task.completed,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка обновления:", error.message);
      }
    }
  }, []);

  const deleteTask = useCallback(async (task: Task) => {
    try {
      await deleteTaskById(task.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка при удалении:", error.message);
      }
    }
  }, []);

  // Group tasks by date
  const groupedTasks = useMemo(() => {
    if (!tasks) return {};
    return groupTasksByDate(tasks);
  }, [tasks]);

  // Sort date keys (newest first for completed tasks)
  const sortedDateKeys = useMemo(() => {
    const keys = Object.keys(groupedTasks);
    return keys.sort((a, b) => {
      if (a === "no-date") return 1;
      if (b === "no-date") return -1;
      return compareAsc(new Date(b), new Date(a)); // Descending order
    });
  }, [groupedTasks]);

  // Helper function to get date label
  const getDateLabel = (dateKey: string): string => {
    if (dateKey === "no-date") return t("noDueDate");
    const date = new Date(dateKey);
    if (isToday(date)) return t("today");
    if (isTomorrow(date)) return t("tomorrow");
    if (isYesterday(date)) return t("yesterday");
    return format(date, "d MMMM", { locale });
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }
  const hasTasks = tasks && tasks.length > 0;

  return (
    <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-3xl px-3 sm:px-4">
        <h1 className="sticky top-0 z-50 bg-background py-2 text-2xl font-bold mb-4 text-left hidden md:block">
          {t("completedTasks")}
        </h1>

        {!hasTasks ? (
          <p className="text-muted-foreground text-left">
            {t("noCompletedTasks")}
          </p>
        ) : (
          <div className="space-y-6 pb-6">
            {sortedDateKeys.map((dateKey, index) => {
              const tasksForDate = groupedTasks[dateKey];
              const dateLabel = getDateLabel(dateKey);
              const isTodayDate =
                dateKey !== "no-date" && isToday(new Date(dateKey));
              const isCollapsed = collapsedGroups.has(dateKey);

              return (
                <motion.div
                  key={dateKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  {/* Date Header with collapse button */}
                  <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-2 border-b border-border">
                    <button
                      onClick={() => toggleGroup(dateKey)}
                      className="flex items-center gap-2 w-full text-left hover:bg-accent/50 rounded-md px-1 py-1 -mx-1 transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <h2
                        className={`
                          text-sm font-semibold uppercase tracking-wide
                          ${isTodayDate ? "text-primary" : "text-muted-foreground"}
                        `}
                      >
                        {dateLabel}
                        {dateKey !== "no-date" && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {format(new Date(dateKey), "EEE", { locale })}
                          </span>
                        )}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({tasksForDate.length})
                        </span>
                      </h2>
                    </button>
                  </div>

                  {/* Tasks for this date */}
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2 overflow-hidden"
                    >
                      {tasksForDate.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleStatus}
                          onDelete={deleteTask}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

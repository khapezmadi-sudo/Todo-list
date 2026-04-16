import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task } from "@/types/task";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/firebase";
import { deleteTaskById } from "@/services/taskService";
import { Loading } from "@/components/shared/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ImportantPage = () => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );
  const isLoading = tasks === null;
  const { t } = useTranslation();

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
        // Query: userId + isImportant + completed (requires composite index)
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          where("isImportant", "==", true),
          where("completed", "==", false),
          orderBy("dueDate", "asc"),
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

  const deleteTask = useCallback(async (task: Task) => {
    try {
      await deleteTaskById(task.id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Ошибка при удалении:", error.message);
      }
    }
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

  // Group tasks by priority
  const groupedTasks = useMemo(() => {
    if (!tasks) return {} as Record<number, Task[]>;
    const groups: Record<number, Task[]> = { 3: [], 2: [], 1: [], 0: [] };
    tasks.forEach((task) => {
      const p = task.priority || 0;
      if (groups[p]) groups[p].push(task);
      else groups[0].push(task);
    });
    return groups;
  }, [tasks]);

  // Priority config for display
  const prioritySections = [
    {
      level: 3,
      key: "priority-high",
      icon: "🔴",
      labelKey: "priorityHigh",
      color: "text-destructive",
      bg: "bg-red-500/5",
      border: "border-red-500/20",
    },
    {
      level: 2,
      key: "priority-medium",
      icon: "🟠",
      labelKey: "priorityMedium",
      color: "text-amber-600",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
    },
    {
      level: 1,
      key: "priority-low",
      icon: "🟡",
      labelKey: "priorityLow",
      color: "text-muted-foreground",
      bg: "bg-muted/30",
      border: "border-border",
    },
    {
      level: 0,
      key: "priority-none",
      icon: "⚪",
      labelKey: "priorityNone",
      color: "text-muted-foreground",
      bg: "bg-transparent",
      border: "border-border",
    },
  ];

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
          {t("importantTasks")}
        </h1>

        {!hasTasks ? (
          <p className="text-muted-foreground text-left">
            {t("noImportantTasks")}
          </p>
        ) : (
          <div className="space-y-4 pb-6">
            {prioritySections.map((section, index) => {
              const tasksForPriority = groupedTasks[section.level] || [];
              if (tasksForPriority.length === 0) return null;

              const isCollapsed = collapsedGroups.has(section.key);

              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={cn(
                    "rounded-xl border overflow-hidden",
                    section.border,
                    section.bg,
                  )}
                >
                  {/* Priority Header */}
                  <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm py-3 px-4 border-b border-inherit">
                    <button
                      onClick={() => toggleGroup(section.key)}
                      className="flex items-center gap-3 w-full text-left hover:bg-accent/30 rounded-md px-2 py-1 -mx-2 transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <h2
                        className={cn(
                          "text-sm font-bold uppercase tracking-wide",
                          section.color,
                        )}
                      >
                        <span className="mr-2">{section.icon}</span>
                        {/* @ts-expect-error i18n key */}
                        {t(section.labelKey)}
                      </h2>
                      <span className="ml-auto text-xs font-medium text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
                        {tasksForPriority.length}
                      </span>
                    </button>
                  </div>

                  {/* Tasks for this priority */}
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-3 space-y-2"
                    >
                      {tasksForPriority.map((task) => (
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

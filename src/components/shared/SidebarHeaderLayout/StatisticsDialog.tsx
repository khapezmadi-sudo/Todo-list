import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import type { Task } from "@/types/task";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useTranslation } from "react-i18next";

/* ---------- Last 7 Days Generator ---------- */

const today = new Date();
today.setHours(0, 0, 0, 0);

const last7DaysStart = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
})();

export const StatisticsDialog: React.FC = () => {
  const [createdLast7Days, setCreatedLast7Days] = useState<Task[]>([]);
  const [openTasks, setOpenTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const { t, i18n } = useTranslation();

  const chartConfig = useMemo(() => {
    return {
      created: {
        label: t("statsCreated"),
        color: "#2563eb",
      },
      completed: {
        label: t("statsCompleted"),
        color: "#22c55e",
      },
    } satisfies ChartConfig;
  }, [t]);

  useEffect(() => {
    let unsubscribeCreated: (() => void) | undefined;
    let unsubscribeOpen: (() => void) | undefined;
    let unsubscribeCompleted: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setCreatedLast7Days([]);
        setOpenTasks([]);
        setCompletedTasks([]);
        return;
      }

      const qCreatedLast7 = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        where("createdAt", ">=", last7DaysStart),
      );

      const qOpen = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        where("completed", "==", false),
      );

      const qCompleted = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        where("completed", "==", true),
      );

      unsubscribeCreated = onSnapshot(qCreatedLast7, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setCreatedLast7Days(data);
      });

      unsubscribeOpen = onSnapshot(qOpen, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setOpenTasks(data);
      });

      unsubscribeCompleted = onSnapshot(qCompleted, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setCompletedTasks(data);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCreated?.();
      unsubscribeOpen?.();
      unsubscribeCompleted?.();
    };
  }, []);

  const dueMetrics = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfNext7 = new Date(startOfTomorrow);
    startOfNext7.setDate(startOfNext7.getDate() + 7);

    let overdue = 0;
    let dueToday = 0;
    let dueNext7Days = 0;
    let noDueDate = 0;

    openTasks.forEach((task) => {
      const due = task.dueDate?.toDate ? task.dueDate.toDate() : null;
      if (!due) {
        noDueDate += 1;
        return;
      }

      const dueTime = due.getTime();
      if (dueTime < startOfToday.getTime()) {
        overdue += 1;
        return;
      }

      if (
        dueTime >= startOfToday.getTime() &&
        dueTime < startOfTomorrow.getTime()
      ) {
        dueToday += 1;
        return;
      }

      if (
        dueTime >= startOfTomorrow.getTime() &&
        dueTime < startOfNext7.getTime()
      ) {
        dueNext7Days += 1;
      }
    });

    return {
      overdue,
      dueToday,
      dueNext7Days,
      noDueDate,
    };
  }, [openTasks]);

  const completionRate = useMemo(() => {
    const total = openTasks.length + completedTasks.length;
    if (total === 0) return 0;
    return Math.round((completedTasks.length / total) * 100);
  }, [openTasks.length, completedTasks.length]);

  const chartData = useMemo(() => {
    // 1. Генерируем дни внутри useMemo, чтобы "сегодня" всегда было актуальным
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return {
        time: d.getTime(),
        label: d.toLocaleDateString(i18n.language, { weekday: "short" }),
        created: 0,
        completed: 0,
      };
    });

    const map = new Map(days.map((day) => [day.time, day]));

    createdLast7Days.forEach((task) => {
      if (!task.createdAt) return;

      const date = task.createdAt.toDate();
      date.setHours(0, 0, 0, 0);
      const key = date.getTime();

      const dayData = map.get(key);
      if (dayData) {
        dayData.created += 1;
        // Если считаем выполненные по дате создания:
        if (task.completed) {
          dayData.completed += 1;
        }
      }
    });

    return days.map(({ label, created, completed }) => ({
      day: label,
      created,
      completed,
    }));
  }, [createdLast7Days, i18n.language]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ChartNoAxesColumnIncreasing className=" h-4 w-4" />
          {t("statistics")}
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {t("statistics")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsOpen")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {openTasks.length}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsCompletionRate")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {completionRate}%
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsOverdue")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {dueMetrics.overdue}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsDueToday")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {dueMetrics.dueToday}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsDueNext7Days")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {dueMetrics.dueNext7Days}
            </div>
          </div>

          <div className="rounded-lg border bg-background p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-muted-foreground">
              {t("statsNoDueDate")}
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold">
              {dueMetrics.noDueDate}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div className="mb-2 text-xs sm:text-sm font-medium">
            {t("statsLast7Days")}
          </div>
          <ChartContainer
            config={chartConfig}
            className="min-h-44 sm:min-h-52 w-full"
          >
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 10 }}
              />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend
                content={<ChartLegendContent />}
                className="hidden sm:block"
              />

              <Bar dataKey="created" fill="var(--color-created)" radius={4} />

              <Bar
                dataKey="completed"
                fill="var(--color-completed)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

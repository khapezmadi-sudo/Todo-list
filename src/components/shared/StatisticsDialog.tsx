import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
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

import type { Task } from "@/pages/HomePage";
import { auth, db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const chartConfig = {
  created: {
    label: "Created",
    color: "#2563eb",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
  },
} satisfies ChartConfig;

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
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setTasks([]);
        return;
      }

      const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        where("createdAt", ">=", last7DaysStart),
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(data);
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnapshot?.();
    };
  }, []);

  const chartData = useMemo(() => {
    // 1. Генерируем дни внутри useMemo, чтобы "сегодня" всегда было актуальным
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return {
        time: d.getTime(),
        label: d.toLocaleDateString("ru-RU", { weekday: "short" }),
        created: 0,
        completed: 0,
      };
    });

    const map = new Map(days.map((day) => [day.time, day]));

    tasks.forEach((task) => {
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
  }, [tasks]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <ChartNoAxesColumnIncreasing className="mr-2 h-4 w-4" />
          Статистика
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Статистика</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <ChartContainer config={chartConfig} className="min-h-62.5 w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />

              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

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

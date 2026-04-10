import * as React from "react";

import { db } from "@/firebase";
import type { Task } from "@/types/task";
import { useNotificationSettings } from "@/store/useNotificationSettings";
import {
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  doc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { toast } from "sonner";

function playBeep(volume: number) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = Math.min(1, Math.max(0, volume));

    o.connect(g);
    g.connect(ctx.destination);

    o.start();
    o.stop(ctx.currentTime + 0.25);

    o.onended = () => {
      ctx.close().catch(() => {
        // ignore
      });
    };
  } catch {
    // ignore
  }
}

function firedKey(taskId: string, reminderAtMs: number) {
  return `reminder_fired:${taskId}:${reminderAtMs}`;
}

function shouldFire(task: Task, nowMs: number) {
  if (!task.reminderAt) return false;
  const atMs = task.reminderAt.toMillis();
  if (atMs > nowMs) return false;
  if (task.reminderFiredAt) return false;
  return true;
}

function nextReminder(tasks: Task[], nowMs: number) {
  let next: { task: Task; atMs: number } | null = null;
  for (const t of tasks) {
    if (!t.reminderAt) continue;
    if (t.reminderFiredAt) continue;
    const atMs = t.reminderAt.toMillis();
    if (atMs < nowMs) continue;
    if (!next || atMs < next.atMs) next = { task: t, atMs };
  }
  return next;
}

export function useTaskReminders(uid: string | null | undefined) {
  const settings = useNotificationSettings();
  const tasksRef = React.useRef<Task[]>([]);
  const timerRef = React.useRef<number | null>(null);
  const rescheduleRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (!uid) return;

    let unsub: Unsubscribe | null = null;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", uid),
      where("completed", "==", false),
    );

    unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Task[];
        tasksRef.current = list;
        rescheduleRef.current?.();
      },
      () => {
        tasksRef.current = [];
        rescheduleRef.current?.();
      },
    );

    return () => {
      if (unsub) unsub();
    };
  }, [uid]);

  React.useEffect(() => {
    if (!uid) return;

    const fireTask = async (t: Task) => {
      const nowMs = Date.now();
      if (!t.reminderAt) return;
      const reminderAtMs = t.reminderAt.toMillis();

      const key = firedKey(t.id, reminderAtMs);
      if (localStorage.getItem(key)) return;

      localStorage.setItem(key, "1");

      toast(`Напоминание: ${t.text}`);

      if (settings.soundEnabled) {
        playBeep(settings.volume);
      }

      if (settings.vibrationEnabled && "vibrate" in navigator) {
        try {
          navigator.vibrate?.([80, 40, 80]);
        } catch {
          // ignore
        }
      }

      if (
        settings.systemNotificationsEnabled &&
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("Напоминание", { body: t.text });
        } catch {
          // ignore
        }
      }

      try {
        const taskRef = doc(db, "tasks", t.id);
        if (settings.repeatEnabled && !t.completed) {
          const nextMs = nowMs + settings.repeatMinutes * 60_000;
          const p = updateDoc(taskRef, {
            reminderAt: Timestamp.fromMillis(nextMs),
            reminderFiredAt: null,
          });
          await p;
        } else {
          const p = updateDoc(taskRef, { reminderFiredAt: serverTimestamp() });
          await p;
        }
      } catch {
        // ignore
      }
    };

    const clearTimer = () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = () => {
      clearTimer();
      const nowMs = Date.now();
      const tasks = tasksRef.current;

      for (const t of tasks) {
        if (shouldFire(t, nowMs)) {
          void fireTask(t);
        }
      }

      const next = nextReminder(tasks, nowMs);
      if (!next) return;

      const delay = Math.max(0, Math.min(2_147_483_647, next.atMs - nowMs));
      timerRef.current = window.setTimeout(() => {
        const fresh = tasksRef.current.find((x) => x.id === next.task.id);
        if (fresh) void fireTask(fresh);
        schedule();
      }, delay);
    };

    rescheduleRef.current = schedule;
    schedule();

    const onVisibilityOrFocus = () => {
      schedule();
    };

    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      clearTimer();
      rescheduleRef.current = null;
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [
    uid,
    settings.repeatEnabled,
    settings.repeatMinutes,
    settings.soundEnabled,
    settings.systemNotificationsEnabled,
    settings.vibrationEnabled,
    settings.volume,
  ]);
}

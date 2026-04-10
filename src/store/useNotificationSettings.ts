import { create } from "zustand";

type NotificationSettingsState = {
  soundEnabled: boolean;
  volume: number; // 0..1
  vibrationEnabled: boolean;
  repeatEnabled: boolean;
  repeatMinutes: number;
  systemNotificationsEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  setVolume: (v: number) => void;
  setVibrationEnabled: (v: boolean) => void;
  setRepeatEnabled: (v: boolean) => void;
  setRepeatMinutes: (v: number) => void;
  setSystemNotificationsEnabled: (v: boolean) => void;
};

const STORAGE_KEY = "notification_settings_v1";

function loadInitial(): Pick<
  NotificationSettingsState,
  | "soundEnabled"
  | "volume"
  | "vibrationEnabled"
  | "repeatEnabled"
  | "repeatMinutes"
  | "systemNotificationsEnabled"
> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no settings");
    const data = JSON.parse(raw) as Partial<NotificationSettingsState>;
    return {
      soundEnabled: data.soundEnabled ?? true,
      volume: typeof data.volume === "number" ? Math.min(1, Math.max(0, data.volume)) : 0.2,
      vibrationEnabled: data.vibrationEnabled ?? true,
      repeatEnabled: data.repeatEnabled ?? false,
      repeatMinutes: typeof data.repeatMinutes === "number" ? Math.max(1, Math.round(data.repeatMinutes)) : 5,
      systemNotificationsEnabled: data.systemNotificationsEnabled ?? false,
    };
  } catch {
    return {
      soundEnabled: true,
      volume: 0.2,
      vibrationEnabled: true,
      repeatEnabled: false,
      repeatMinutes: 5,
      systemNotificationsEnabled: false,
    };
  }
}

function save(next: Partial<NotificationSettingsState>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current = raw ? (JSON.parse(raw) as object) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...next }));
  } catch {
    // ignore
  }
}

const initial = typeof window === "undefined" ? {
  soundEnabled: true,
  volume: 0.2,
  vibrationEnabled: true,
  repeatEnabled: false,
  repeatMinutes: 5,
  systemNotificationsEnabled: false,
} : loadInitial();

export const useNotificationSettings = create<NotificationSettingsState>()((set) => ({
  ...initial,
  setSoundEnabled: (v) => {
    save({ soundEnabled: v });
    set({ soundEnabled: v });
  },
  setVolume: (v) => {
    const next = Math.min(1, Math.max(0, v));
    save({ volume: next });
    set({ volume: next });
  },
  setVibrationEnabled: (v) => {
    save({ vibrationEnabled: v });
    set({ vibrationEnabled: v });
  },
  setRepeatEnabled: (v) => {
    save({ repeatEnabled: v });
    set({ repeatEnabled: v });
  },
  setRepeatMinutes: (v) => {
    const next = Math.max(1, Math.round(v));
    save({ repeatMinutes: next });
    set({ repeatMinutes: next });
  },
  setSystemNotificationsEnabled: (v) => {
    save({ systemNotificationsEnabled: v });
    set({ systemNotificationsEnabled: v });
  },
}));

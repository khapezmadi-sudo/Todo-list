import React from "react";

import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { auth, db } from "@/firebase";
import { deleteTaskById } from "@/services/taskService";
import type { Task } from "@/types/task";
import type { AppUser } from "@/types/user";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";

type AdminDoc = {
  createdAt?: unknown;
  createdBy?: string;
};

export const AdminPage: React.FC = () => {
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [admins, setAdmins] = React.useState<string[] | null>(null);
  const [users, setUsers] = React.useState<AppUser[] | null>(null);
  const [usersQueryText, setUsersQueryText] = React.useState("");
  const [newAdminUid, setNewAdminUid] = React.useState("");
  const [isAddingAdmin, setIsAddingAdmin] = React.useState(false);

  const isLoading = tasks === null || admins === null || users === null;

  React.useEffect(() => {
    const tasksQuery = query(
      collection(db, "tasks"),
      orderBy("createdAt", "desc"),
    );
    const unsubTasks = onSnapshot(
      tasksQuery,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Task[];
        setTasks(data);
      },
      () => setTasks([]),
    );

    const adminsQuery = query(collection(db, "admins"));
    const unsubAdmins = onSnapshot(
      adminsQuery,
      (snap) => {
        const ids = snap.docs.map((d) => d.id);
        setAdmins(ids);
      },
      () => setAdmins([]),
    );

    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(
      usersQuery,
      (snap) => {
        const data = snap.docs.map((d) => ({
          uid: d.id,
          ...(d.data() as object),
        })) as AppUser[];
        setUsers(data);
      },
      () => setUsers([]),
    );

    return () => {
      unsubTasks();
      unsubAdmins();
      unsubUsers();
    };
  }, []);

  const stats = React.useMemo(() => {
    const list = tasks ?? [];
    const total = list.length;
    const completed = list.filter((t) => t.completed).length;
    const important = list.filter((t) => t.isImportant).length;
    const users = new Set(list.map((t) => t.userId).filter(Boolean)).size;
    return { total, completed, important, users };
  }, [tasks]);

  const deleteTask = React.useCallback(async (task: Task) => {
    await deleteTaskById(task.id);
  }, []);

  const handleToggleCompleted = React.useCallback(async (task: Task) => {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, { completed: !task.completed });
  }, []);

  const handleAddAdmin = async () => {
    const uid = newAdminUid.trim();
    if (!uid) return;

    const me = auth.currentUser?.uid;
    if (!me) return;

    try {
      setIsAddingAdmin(true);
      const ref = doc(db, "admins", uid);
      const payload: AdminDoc = { createdAt: serverTimestamp(), createdBy: me };
      const p = setDoc(ref, payload, { merge: true });
      toast.promise(p, {
        loading: "Добавление...",
        success: "Админ добавлен",
        error: "Не удалось добавить админа",
      });
      await p;
      setNewAdminUid("");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (uid: string) => {
    const ref = doc(db, "admins", uid);
    const p = deleteDoc(ref);
    toast.promise(p, {
      loading: "Удаление...",
      success: "Админ удалён",
      error: "Не удалось удалить админа",
    });
    await p;
  };

  const handleToggleUserBan = async (user: AppUser) => {
    const ref = doc(db, "users", user.uid);
    const p = updateDoc(ref, { banned: !user.banned });
    const action = user.banned ? "Разблокировка" : "Блокировка";
    toast.promise(p, {
      loading: `${action}...`,
      success: user.banned
        ? "Пользователь разблокирован"
        : "Пользователь заблокирован",
      error: "Не удалось обновить пользователя",
    });
    await p;
  };

  const filteredUsers = React.useMemo(() => {
    const q = usersQueryText.trim().toLowerCase();
    const list = users ?? [];
    if (!q) return list;
    return list.filter((u) => {
      const hay =
        `${u.uid} ${u.email ?? ""} ${u.displayName ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, usersQueryText]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100svh-64px)] md:h-[calc(100vh-120px)] flex justify-center">
      <ScrollArea className="w-full max-w-6xl px-3 sm:px-4">
        <div className="mb-4 flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Управление админами и просмотр всех задач.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">Всего задач</div>
            <div className="mt-1 text-xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">Выполнено</div>
            <div className="mt-1 text-xl font-semibold">{stats.completed}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">Важные</div>
            <div className="mt-1 text-xl font-semibold">{stats.important}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">Пользователей</div>
            <div className="mt-1 text-xl font-semibold">{stats.users}</div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold">Админы</div>
              <div className="text-xs text-muted-foreground">
                Коллекция: admins (docId = uid)
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-uid">Добавить админа по UID</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-uid"
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  placeholder="UID"
                />
                <Button
                  type="button"
                  onClick={handleAddAdmin}
                  disabled={!newAdminUid.trim() || isAddingAdmin}
                >
                  Добавить
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {admins!.length === 0 ? (
                <div className="text-sm text-muted-foreground">Админов нет</div>
              ) : (
                admins!.map((uid) => (
                  <div
                    key={uid}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background p-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{uid}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRemoveAdmin(uid)}
                      disabled={uid === auth.currentUser?.uid}
                    >
                      Удалить
                    </Button>
                  </div>
                ))
              )}
              <div className="text-xs text-muted-foreground">
                Нельзя удалить самого себя.
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border bg-card p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold">Все задачи</div>
              <div className="text-xs text-muted-foreground">
                Видно только админам.
              </div>
            </div>

            {tasks!.length === 0 ? (
              <div className="text-sm text-muted-foreground">Задач нет</div>
            ) : (
              <div className="space-y-2">
                {tasks!.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleCompleted}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Пользователи</div>
              <div className="text-xs text-muted-foreground">
                Soft-ban через поле users/{"{uid}"}.banned
              </div>
            </div>
            <div className="w-full sm:max-w-xs">
              <Input
                value={usersQueryText}
                onChange={(e) => setUsersQueryText(e.target.value)}
                placeholder="Поиск: uid / email / имя"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Пользователей нет
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u) => (
                <div
                  key={u.uid}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {u.displayName || u.email || u.uid}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {u.uid}
                    </div>
                    {u.email && (
                      <div className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-xs text-muted-foreground">
                      {u.banned ? "Заблокирован" : "Активен"}
                    </div>
                    <Switch
                      checked={Boolean(u.banned)}
                      onCheckedChange={() => handleToggleUserBan(u)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </ScrollArea>
    </div>
  );
};

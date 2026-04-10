import React from "react";

import TaskItem from "@/components/shared/Task/TaskItem/TaskItem";
import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/firebase";
import {
  deleteTaskById,
  subscribeAllTasks,
  toggleTaskCompleted,
} from "@/services/taskService";
import {
  addAdminByUid,
  removeAdminByUid,
  subscribeAdmins,
} from "@/services/adminService";
import { setUserBanned, subscribeUsers } from "@/services/userService";
import type { Task } from "@/types/task";
import type { AppUser } from "@/types/user";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const AdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = React.useState<Task[] | null>(null);
  const [admins, setAdmins] = React.useState<string[] | null>(null);
  const [users, setUsers] = React.useState<AppUser[] | null>(null);
  const [usersQueryText, setUsersQueryText] = React.useState("");
  const [newAdminUid, setNewAdminUid] = React.useState("");
  const [isAddingAdmin, setIsAddingAdmin] = React.useState(false);

  const isLoading = tasks === null || admins === null || users === null;

  React.useEffect(() => {
    const unsubTasks = subscribeAllTasks(setTasks, () => setTasks([]));
    const unsubAdmins = subscribeAdmins(setAdmins, () => setAdmins([]));
    const unsubUsers = subscribeUsers(setUsers, () => setUsers([]));

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
    await toggleTaskCompleted(task);
  }, []);

  const handleAddAdmin = async () => {
    const uid = newAdminUid.trim();
    if (!uid) return;

    const me = auth.currentUser?.uid;
    if (!me) return;

    try {
      setIsAddingAdmin(true);
      const p = addAdminByUid(uid, me);
      toast.promise(p, {
        loading: t("adminToastAdding"),
        success: t("adminToastAdminAdded"),
        error: t("adminToastAdminAddFailed"),
      });
      await p;
      setNewAdminUid("");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (uid: string) => {
    const p = removeAdminByUid(uid);
    toast.promise(p, {
      loading: t("adminToastDeleting"),
      success: t("adminToastAdminRemoved"),
      error: t("adminToastAdminRemoveFailed"),
    });
    await p;
  };

  const handleToggleUserBan = async (user: AppUser) => {
    const p = setUserBanned(user.uid, !user.banned);
    const action = user.banned ? t("adminUnbanAction") : t("adminBanAction");
    toast.promise(p, {
      loading: `${action}...`,
      success: user.banned
        ? t("adminToastUserUnbanned")
        : t("adminToastUserBanned"),
      error: t("adminToastUserUpdateFailed"),
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
          <h1 className="text-2xl font-bold">{t("adminPanelTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("adminPanelSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">
              {t("adminStatsTotalTasks")}
            </div>
            <div className="mt-1 text-xl font-semibold">{stats.total}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">
              {t("adminStatsCompleted")}
            </div>
            <div className="mt-1 text-xl font-semibold">{stats.completed}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">
              {t("adminStatsImportant")}
            </div>
            <div className="mt-1 text-xl font-semibold">{stats.important}</div>
          </div>
          <div className="rounded-xl border bg-card p-3">
            <div className="text-xs text-muted-foreground">
              {t("adminStatsUsers")}
            </div>
            <div className="mt-1 text-xl font-semibold">{stats.users}</div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold">
                {t("adminAdminsTitle")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("adminAdminsCollectionHint")}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-uid">{t("adminAddAdminLabel")}</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-uid"
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  placeholder={t("adminUidPlaceholder")}
                />
                <Button
                  type="button"
                  onClick={handleAddAdmin}
                  disabled={!newAdminUid.trim() || isAddingAdmin}
                >
                  {t("adminAdd")}
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {admins!.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {t("adminNoAdmins")}
                </div>
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
                      {t("delete")}
                    </Button>
                  </div>
                ))
              )}
              <div className="text-xs text-muted-foreground">
                {t("adminCannotRemoveSelf")}
              </div>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border bg-card p-4">
            <div className="mb-3">
              <div className="text-sm font-semibold">
                {t("adminAllTasksTitle")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("adminAllTasksHint")}
              </div>
            </div>

            {tasks!.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {t("adminNoTasks")}
              </div>
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
              <div className="text-sm font-semibold">
                {t("adminUsersTitle")}
              </div>
              <div className="text-xs text-muted-foreground">
                {t("adminUsersBanHint")}
              </div>
            </div>
            <div className="w-full sm:max-w-xs">
              <Input
                value={usersQueryText}
                onChange={(e) => setUsersQueryText(e.target.value)}
                placeholder={t("adminUsersSearchPlaceholder")}
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("adminNoUsers")}
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
                      {u.banned ? t("adminUserBanned") : t("adminUserActive")}
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

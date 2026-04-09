import React, { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";

import { SidebarMenuButton } from "../ui/sidebar";

import { Search } from "lucide-react";

import { Input } from "../ui/input";

import type { Task } from "@/types/task";

import { useDebounce } from "use-debounce";

import { auth, db } from "@/firebase";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import TaskItemById from "./Task/TaskItem/TaskItemById";
import { ScrollArea } from "../ui/scroll-area";
import { Loading } from "./Loading";
import { useTranslation } from "react-i18next";

export const SearchDialog: React.FC = () => {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [debouncedSearch] = useDebounce(searchQuery, 400);
  const { t } = useTranslation();

  // Подписка только при открытом диалоге
  useEffect(() => {
    if (!open) return; // Если закрыто — ничего не делаем

    let unsubscribeSnapshot: () => void;
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, "tasks"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );

        unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];
          setTasks(tasksData);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [open]); // Зависимость от open

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    const query = debouncedSearch.toLowerCase().trim();
    if (!query) return tasks; // Если пусто — показываем все (или последние)

    return tasks.filter((task) => task.text.toLowerCase().includes(query));
  }, [tasks, debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Теперь кнопка в сайдбаре всегда доступна */}
        <SidebarMenuButton className="cursor-pointer text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>{t("search")}</span>
        </SidebarMenuButton>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl shadow-xl top-24 translate-y-0">
        <div className="flex items-center gap-3 border-b px-4 py-3 bg-muted/30">
          <Search className="text-muted-foreground" size={18} />
          <Input
            type="text"
            autoFocus // Чтобы сразу можно было писать
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent shadow-none text-base focus-visible:ring-0 px-0 h-auto text-foreground"
          />
        </div>

        <ScrollArea className="max-h-80 overflow-y-auto min-h-25">
          {/* Лоадер теперь внутри контента диалога */}
          {tasks === null ? (
            <div className="flex items-center justify-center py-10">
              <Loading />
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItemById
                key={task.id}
                task={task}
                // Закрываем поиск при клике на задачу
                trigger={
                  <div className="px-4 py-3 cursor-pointer transition-colors hover:bg-muted/60 border-b last:border-none">
                    <p className="text-sm font-medium">{task.text}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                        {task.description}
                      </p>
                    )}
                  </div>
                }
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm">
              {searchQuery ? t("searchNoResults") : t("searchStartTyping")}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

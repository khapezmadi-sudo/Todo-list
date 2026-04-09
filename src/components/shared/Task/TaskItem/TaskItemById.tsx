import type { Task } from "@/types/task";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Calendar, CheckCircle2, Circle, Clock, AlignLeft } from "lucide-react";
import useCurrentUser from "@/store/useCurrentUser";

interface TaskItemByIdProps {
  task: Task;
  trigger: React.ReactNode;
}

const TaskItemById: React.FC<TaskItemByIdProps> = ({ task, trigger }) => {
  const currentUser = useCurrentUser((state) => state.currentUser);
  // Форматируем дату из Firebase Timestamp
  const formattedDate = task.createdAt?.toDate
    ? task.createdAt
        .toDate()
        .toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : "Дата не указана";

  const formattedDueDate = task.dueDate?.toDate
    ? task.dueDate
        .toDate()
        .toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
    : null;

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="  gap-0 p-0 overflow-hidden border-none ">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {task.completed ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} /> Выполнено
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                  <Circle size={12} /> Не выполнено
                </div>
              )}
            </div>
            <DialogTitle className="text-2xl font-semibold leading-tight text-slate-900">
              {task.text}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Описание */}
            <div className="flex gap-3">
              <AlignLeft className="shrink-0 text-slate-400 mt-1" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                  Описание
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {task.description ||
                    "Описание к этой задаче еще не добавлено..."}
                </p>
              </div>
            </div>

            {/* Мета-данные (Дата создания) */}
            <div className="flex gap-3">
              <Calendar className="shrink-0 text-slate-400 mt-1" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                  Создано
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>{formattedDate}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {task.createdAt?.toDate().toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {formattedDueDate && (
              <div className="flex gap-3">
                <Calendar className="shrink-0 text-slate-400 mt-1" size={18} />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-tight">
                    Срок
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{formattedDueDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Подвал с "madi" в стиле чипа */}
          <div className="mt-10 pt-6 border-t flex justify-between items-center">
            <div className="text-[10px] text-slate-400 font-mono italic">
              ID: {task.id.slice(0, 8)}...
            </div>
            <div className="px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <span className="text-xs font-bold text-slate-800 tracking-widest uppercase">
                {currentUser?.displayName}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(TaskItemById);

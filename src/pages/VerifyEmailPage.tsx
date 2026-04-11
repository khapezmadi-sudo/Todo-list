import React from "react";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";
import { reload, sendEmailVerification, signOut } from "firebase/auth";
import { toast } from "sonner";
import { Link } from "react-router";

export const VerifyEmailPage: React.FC = () => {
  const [isSending, setIsSending] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const email = auth.currentUser?.email ?? "";
  const isVerified = Boolean(auth.currentUser?.emailVerified);
  const hasUser = Boolean(auth.currentUser);

  const resend = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsSending(true);
      const p = sendEmailVerification(user);
      toast.promise(p, {
        loading: "Отправляем письмо...",
        success: "Письмо отправлено",
        error: "Не удалось отправить письмо",
      });
      await p;
    } finally {
      setIsSending(false);
    }
  };

  const refresh = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsRefreshing(true);
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        toast.success("Email подтверждён");
      } else {
        toast.message("Пока не подтверждено. Проверь почту и нажми ещё раз.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-d-screen flex items-center justify-center px-4 py-safe">
      <div className="w-full max-w-md rounded-xl border bg-card p-6">
        <div className="text-xl font-semibold">Подтверди email</div>
        <div className="mt-2 text-sm text-muted-foreground">
          {hasUser ? (
            <>
              Мы отправили письмо на:
              <div className="mt-1 font-medium text-foreground wrap-break-word">
                {email || "(email не найден)"}
              </div>
            </>
          ) : (
            <>
              Похоже, ты не в аккаунте. Войди ещё раз и вернись сюда.
              <div className="mt-2">
                <Link
                  className="text-primary underline underline-offset-4 inline-block py-2 px-1 -mx-1 relative z-10"
                  to="/login"
                >
                  Перейти на вход
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <Button
            type="button"
            onClick={resend}
            disabled={isSending || isVerified || !hasUser}
          >
            Отправить письмо ещё раз
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={isRefreshing || !hasUser}
          >
            Я подтвердил — обновить
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => signOut(auth)}
            disabled={!hasUser}
          >
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { signOut } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase";

export const BannedPage: React.FC = () => {
  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 text-center">
        <div className="text-xl font-semibold">Доступ ограничен</div>
        <div className="mt-2 text-sm text-muted-foreground">
          Ваш аккаунт заблокирован администратором.
        </div>
        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={() => signOut(auth)}
        >
          Выйти
        </Button>
      </div>
    </div>
  );
};

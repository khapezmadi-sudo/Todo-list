import React from "react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { useTranslation } from "react-i18next";
import useCurrentUser from "@/store/useCurrentUser";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/firebase";
import { Switch } from "@/components/ui/switch";
import { useNotificationSettings } from "@/store/useNotificationSettings";
import {
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { toast } from "sonner";
import ConfirmDialog from "../ConfirmDialog";

export const SettingsDialog: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser((state) => state.currentUser);
  const setCurrentUser = useCurrentUser((state) => state.setCurrentUser);
  const notificationSettings = useNotificationSettings();
  const [open, setOpen] = React.useState(false);
  const [displayName, setDisplayName] = React.useState<string>(
    currentUser?.displayName ?? "",
  );
  const [photoURL, setPhotoURL] = React.useState<string>(
    currentUser?.photoURL ?? "",
  );
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setDisplayName(currentUser?.displayName ?? "");
    setPhotoURL(currentUser?.photoURL ?? "");
  }, [open, currentUser?.displayName]);

  const canSaveName =
    !!currentUser &&
    displayName.trim().length > 0 &&
    displayName.trim() !== (currentUser.displayName ?? "");

  const canSavePhoto =
    !!currentUser && photoURL.trim() !== (currentUser.photoURL ?? "");

  const handleSaveName = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const nextName = displayName.trim();
    if (!nextName) return;

    try {
      setIsSavingName(true);
      const p = updateProfile(user, { displayName: nextName });
      toast.promise(p, {
        loading: "Сохранение...",
        success: "Имя обновлено",
        error: "Не удалось обновить имя",
      });
      await p;
      setCurrentUser(auth.currentUser);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSavePhoto = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const next = photoURL.trim();

    try {
      setIsSavingName(true);
      const p = updateProfile(user, { photoURL: next || null });
      toast.promise(p, {
        loading: "Сохранение...",
        success: "Фото обновлено",
        error: "Не удалось обновить фото",
      });
      await p;
      setCurrentUser(auth.currentUser);
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email;
    const providers = auth.currentUser?.providerData ?? [];
    const hasPasswordProvider = providers.some(
      (p) => p.providerId === "password",
    );

    if (!hasPasswordProvider) {
      toast.message(
        "Сброс пароля доступен только для аккаунтов с входом по Email/Password.",
      );
      return;
    }
    if (!email) {
      toast.error("У аккаунта нет email");
      return;
    }
    try {
      setIsSendingReset(true);
      const p = sendPasswordResetEmail(auth, email);
      toast.promise(p, {
        loading: "Отправляем письмо...",
        success: "Письмо для сброса пароля отправлено",
        error: "Не удалось отправить письмо",
      });
      await p;
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setIsDeleting(true);
      const p = deleteUser(user);
      toast.promise(p, {
        loading: "Удаляем аккаунт...",
        success: "Аккаунт удалён",
        error: "Не удалось удалить аккаунт",
      });
      await p;
      setOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SettingsIcon />
          {t("settings")}
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("settings")}</DialogTitle>
          <DialogDescription>
            Управляй профилем и безопасностью аккаунта.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-3">
            <div className="text-sm font-semibold">Профиль</div>
            <div className="grid gap-2">
              <Label htmlFor="settings-display-name">Имя</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  id="settings-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Введите имя"
                  className="h-10"
                />
                <Button
                  type="button"
                  onClick={handleSaveName}
                  disabled={!canSaveName || isSavingName}
                  className="h-10"
                >
                  Сохранить
                </Button>
              </div>

              <Label htmlFor="settings-photo-url" className="mt-2">
                Фото (URL)
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border bg-muted">
                    {photoURL.trim() ? (
                      <img
                        src={photoURL.trim()}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "";
                        }}
                      />
                    ) : null}
                  </div>
                </div>
                <Input
                  id="settings-photo-url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://..."
                  className="h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSavePhoto}
                  disabled={!canSavePhoto || isSavingName}
                  className="h-10"
                >
                  Обновить
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                Email: {currentUser?.email ?? "—"}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="text-sm font-semibold">Уведомления</div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Звук</div>
              <Switch
                checked={notificationSettings.soundEnabled}
                onCheckedChange={notificationSettings.setSoundEnabled}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notif-volume">Громкость</Label>
              <Input
                id="notif-volume"
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={notificationSettings.volume}
                onChange={(e) =>
                  notificationSettings.setVolume(Number(e.target.value || 0))
                }
              />
              <div className="text-xs text-muted-foreground">
                0 — без звука, 1 — максимум.
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Вибрация (моб.)
              </div>
              <Switch
                checked={notificationSettings.vibrationEnabled}
                onCheckedChange={notificationSettings.setVibrationEnabled}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Системные уведомления браузера
              </div>
              <Switch
                checked={notificationSettings.systemNotificationsEnabled}
                onCheckedChange={async (v) => {
                  notificationSettings.setSystemNotificationsEnabled(v);
                  if (
                    v &&
                    typeof Notification !== "undefined" &&
                    Notification.permission !== "granted"
                  ) {
                    try {
                      await Notification.requestPermission();
                    } catch {
                      // ignore
                    }
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Повторять пока не выполнено
              </div>
              <Switch
                checked={notificationSettings.repeatEnabled}
                onCheckedChange={notificationSettings.setRepeatEnabled}
              />
            </div>

            {notificationSettings.repeatEnabled && (
              <div className="grid gap-2">
                <Label htmlFor="notif-repeat">Интервал повтора (мин.)</Label>
                <Input
                  id="notif-repeat"
                  type="number"
                  min={1}
                  step={1}
                  value={notificationSettings.repeatMinutes}
                  onChange={(e) =>
                    notificationSettings.setRepeatMinutes(
                      Number(e.target.value || 1),
                    )
                  }
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="text-sm font-semibold">Безопасность</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Сбросить пароль через email.
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handlePasswordReset}
                disabled={!currentUser?.email || isSendingReset}
              >
                Отправить письмо
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-3">
            <div className="text-sm font-semibold text-destructive">
              Опасная зона
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Удаление аккаунта необратимо.
              </div>

              <ConfirmDialog
                title="Удалить аккаунт?"
                description="Это действие необратимо. Ваш аккаунт будет удалён."
                actionText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
                onConfirm={handleDeleteAccount}
                trigger={
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={!currentUser}
                  >
                    Удалить аккаунт
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

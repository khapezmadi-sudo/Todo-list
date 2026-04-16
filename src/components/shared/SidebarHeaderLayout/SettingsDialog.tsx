import React from "react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import { SettingsIcon, User, Palette, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { ThemeSelector } from "../ThemeSelector";
import { cn } from "@/lib/utils";

type TabType = "account" | "theme" | "notifications";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "account", icon: User },
  { id: "theme", label: "theme", icon: Palette },
  { id: "notifications", label: "notifications", icon: Bell },
];

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: TabType;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open: controlledOpen,
  onOpenChange,
  defaultTab,
}) => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser((state) => state.currentUser);
  const setCurrentUser = useCurrentUser((state) => state.setCurrentUser);
  const notificationSettings = useNotificationSettings();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>(
    defaultTab || "account",
  );

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  // Listen for openSettings event from CommandPalette (only when not controlled)
  React.useEffect(() => {
    if (isControlled) return;

    const handleOpenSettings = (e: CustomEvent) => {
      setInternalOpen(true);
      if (e.detail === "theme") {
        setActiveTab("theme");
      } else if (e.detail === "account") {
        setActiveTab("account");
      } else if (e.detail === "notifications") {
        setActiveTab("notifications");
      }
    };
    window.addEventListener(
      "openSettings",
      handleOpenSettings as EventListener,
    );
    return () =>
      window.removeEventListener(
        "openSettings",
        handleOpenSettings as EventListener,
      );
  }, [isControlled]);

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
        loading: t("settingsToastSaving"),
        success: t("settingsToastNameUpdated"),
        error: t("settingsToastNameUpdateFailed"),
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
        loading: t("settingsToastSaving"),
        success: t("settingsToastPhotoUpdated"),
        error: t("settingsToastPhotoUpdateFailed"),
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
      toast.message(t("settingsResetPasswordOnlyEmailPassword"));
      return;
    }
    if (!email) {
      toast.error(t("settingsNoEmailOnAccount"));
      return;
    }
    try {
      setIsSendingReset(true);
      const p = sendPasswordResetEmail(auth, email);
      toast.promise(p, {
        loading: t("settingsToastSendingEmail"),
        success: t("settingsToastResetEmailSent"),
        error: t("settingsToastResetEmailFailed"),
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
        loading: t("settingsToastDeletingAccount"),
        success: t("settingsToastAccountDeleted"),
        error: t("settingsToastAccountDeleteFailed"),
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
      {!isControlled && (
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <SettingsIcon />
            {t("settings")}
          </DropdownMenuItem>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-3xl max-h-[85svh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{t("settings")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row h-[calc(85svh-80px)]">
          {/* Sidebar Tabs */}
          <div className="flex sm:flex-col border-b sm:border-b-0 sm:border-r border-border bg-muted/30 sm:w-48 shrink-0 overflow-x-auto sm:overflow-x-visible">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                    "hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-accent text-accent-foreground sm:border-r-2 sm:border-r-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {/* @ts-expect-error i18n key */}
                  <span className="capitalize">{t(tab.label)}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Account Content */}
                <div className="grid gap-3">
                  <div className="text-sm font-semibold">
                    {t("settingsProfile")}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="settings-display-name">
                      {t("settingsName")}
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        id="settings-display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t("settingsNamePlaceholder")}
                        className="h-10"
                      />
                      <Button
                        type="button"
                        onClick={handleSaveName}
                        disabled={!canSaveName || isSavingName}
                        className="h-10"
                      >
                        {t("save")}
                      </Button>
                    </div>

                    <Label htmlFor="settings-photo-url" className="mt-2">
                      {t("settingsPhotoUrl")}
                    </Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border bg-muted">
                          {photoURL.trim() ? (
                            <img
                              src={photoURL.trim()}
                              alt={t("settingsAvatarPreviewAlt")}
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
                        {t("update")}
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {t("email")}: {currentUser?.email ?? "—"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="text-sm font-semibold">
                    {t("settingsSecurity")}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t("settingsResetPasswordDescription")}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={!currentUser?.email || isSendingReset}
                    >
                      {t("settingsSendResetEmail")}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-3">
                  <div className="text-sm font-semibold text-destructive">
                    {t("settingsDangerZone")}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t("settingsDeleteAccountHint")}
                    </div>

                    <ConfirmDialog
                      title={t("settingsDeleteAccountTitle")}
                      description={t("settingsDeleteAccountDescription")}
                      actionText={t("delete")}
                      variant="destructive"
                      isLoading={isDeleting}
                      onConfirm={handleDeleteAccount}
                      trigger={
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={!currentUser}
                        >
                          {t("settingsDeleteAccountButton")}
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-6">
                <div className="grid gap-3">
                  <div className="text-sm font-semibold">{t("theme")}</div>
                  <p className="text-sm text-muted-foreground">
                    {t("settingsThemeDescription")}
                  </p>
                  <div className="pt-2">
                    <ThemeSelector />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="grid gap-3">
                  <div className="text-sm font-semibold">
                    {t("settingsNotifications")}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {t("settingsSound")}
                    </div>
                    <Switch
                      checked={notificationSettings.soundEnabled}
                      onCheckedChange={notificationSettings.setSoundEnabled}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notif-volume">{t("settingsVolume")}</Label>
                    <Input
                      id="notif-volume"
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={notificationSettings.volume}
                      onChange={(e) =>
                        notificationSettings.setVolume(
                          Number(e.target.value || 0),
                        )
                      }
                    />
                    <div className="text-xs text-muted-foreground">
                      {t("settingsVolumeHint")}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {t("settingsVibration")}
                    </div>
                    <Switch
                      checked={notificationSettings.vibrationEnabled}
                      onCheckedChange={notificationSettings.setVibrationEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {t("settingsSystemNotifications")}
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
                      {t("settingsRepeatUntilDone")}
                    </div>
                    <Switch
                      checked={notificationSettings.repeatEnabled}
                      onCheckedChange={notificationSettings.setRepeatEnabled}
                    />
                  </div>

                  {notificationSettings.repeatEnabled && (
                    <div className="grid gap-2">
                      <Label htmlFor="notif-repeat">
                        {t("settingsRepeatInterval")}
                      </Label>
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
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

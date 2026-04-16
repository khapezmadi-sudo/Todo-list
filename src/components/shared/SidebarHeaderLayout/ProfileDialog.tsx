import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { UserIcon } from "lucide-react";
import { DropdownMenuItem } from "../../ui/dropdown-menu";
import useCurrentUser from "@/store/useCurrentUser";
import { useTranslation } from "react-i18next";

interface ProfileDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ProfileDialog: React.FC<ProfileDialogProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const currentUser = useCurrentUser((state) => state.currentUser);
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  // Listen for openProfile event from CommandPalette (only when not controlled)
  React.useEffect(() => {
    if (isControlled) return;

    const handleOpenProfile = () => setInternalOpen(true);
    window.addEventListener("openProfile", handleOpenProfile);
    return () => window.removeEventListener("openProfile", handleOpenProfile);
  }, [isControlled]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <UserIcon className=" h-4 w-4" />
            {t("profile")}
          </DropdownMenuItem>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("profile")}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover border"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold">
              {currentUser?.displayName || "No name"}
            </p>

            <p className="text-sm text-muted-foreground">
              {currentUser?.email}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              UID: {currentUser?.uid}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

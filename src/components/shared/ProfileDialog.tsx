import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { UserIcon } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import useCurrentUser from "@/store/useCurrentUser";

export const ProfileDialog: React.FC = () => {
  const currentUser = useCurrentUser((state) => state.currentUser);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <UserIcon className=" h-4 w-4" />
          Профиль
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Профиль</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center gap-4">
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt="Avatar"
              className="h-24 w-24 rounded-full object-cover border"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-gray-500" />
            </div>
          )}

          <div className="text-center">
            <p className="text-lg font-semibold">
              {currentUser?.displayName || "No name"}
            </p>

            <p className="text-sm text-muted-foreground">
              {currentUser?.email}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              UID: {currentUser?.uid}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

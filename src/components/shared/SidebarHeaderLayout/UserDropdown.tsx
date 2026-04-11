import React from "react";
import { SidebarMenuButton } from "../../ui/sidebar";
import { ChevronDown, User } from "lucide-react";
import useCurrentUser from "@/store/useCurrentUser";
import { DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

export const UserDropdown: React.FC = () => {
  const currentUser = useCurrentUser((state) => state.currentUser);
  return (
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton className="flex w-full items-center gap-2 justify-between group-data-[collapsible=icon]:justify-center text-primary-foreground hover:bg-primary-foreground/10">
        <div className="flex items-center gap-2">
          {currentUser?.photoURL ? (
            <Avatar className="h-6 w-6 shrink-0 border border-primary-foreground/20">
              <AvatarImage
                src={currentUser.photoURL}
                alt={currentUser.displayName ?? "User avatar"}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                U
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-6 w-6 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/20 shrink-0">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          )}

          <span className="text-sm font-medium truncate max-w-30 group-data-[collapsible=icon]:hidden">
            {currentUser?.displayName}
          </span>
        </div>

        <ChevronDown className="h-4 w-4 opacity-80 group-data-[collapsible=icon]:hidden" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
  );
};

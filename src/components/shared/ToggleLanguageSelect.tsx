import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export const ToggleLanguageSelect: React.FC = () => {
  const { t, i18n } = useTranslation();

  const languageLabel =
    i18n.language === "ru"
      ? "Русский"
      : i18n.language === "kk"
        ? "Қазақша"
        : "English";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          className="cursor-pointer"
          tooltip={t("selectLanguage")}
        >
          <Languages className="h-4 w-4" />
          <span className="flex-1">{t("selectLanguage")}</span>
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {languageLabel}
          </span>
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuItem
          onSelect={() => i18n.changeLanguage("en")}
          className={i18n.language === "en" ? "bg-accent" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => i18n.changeLanguage("kk")}
          className={i18n.language === "kk" ? "bg-accent" : ""}
        >
          Қазақша
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => i18n.changeLanguage("ru")}
          className={i18n.language === "ru" ? "bg-accent" : ""}
        >
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

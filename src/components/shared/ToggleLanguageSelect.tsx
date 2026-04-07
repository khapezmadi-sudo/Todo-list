import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ToggleLanguageSelect: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className="w-45">
        <SelectValue className="text-black" placeholder={t("selectLanguage")} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="en">En</SelectItem>
          <SelectItem value="kk">Kz</SelectItem>
          <SelectItem value="ru">Ru</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

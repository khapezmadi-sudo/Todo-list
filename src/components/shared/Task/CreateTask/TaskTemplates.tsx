import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  Calendar,
  Phone,
  CreditCard,
  BookOpen,
  Stethoscope,
  Briefcase,
  Dumbbell,
  Plane,
  Gift,
  Wrench,
  FileText,
} from "lucide-react";

export interface TaskTemplate {
  id: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  description: string;
  priority: number;
}

interface TaskTemplatesProps {
  onSelect: (template: TaskTemplate) => void;
  selectedId?: string | null;
}

export const TaskTemplates: React.FC<TaskTemplatesProps> = ({
  onSelect,
  selectedId,
}) => {
  const { t } = useTranslation();

  const templates: TaskTemplate[] = [
    {
      id: "groceries",
      icon: <ShoppingCart className="h-4 w-4" />,
      title: t("templateGroceries"),
      text: t("templateGroceriesText"),
      description: t("templateGroceriesDesc"),
      priority: 1,
    },
    {
      id: "meeting",
      icon: <Calendar className="h-4 w-4" />,
      title: t("templateMeeting"),
      text: t("templateMeetingText"),
      description: t("templateMeetingDesc"),
      priority: 2,
    },
    {
      id: "call",
      icon: <Phone className="h-4 w-4" />,
      title: t("templateCall"),
      text: t("templateCallText"),
      description: t("templateCallDesc"),
      priority: 2,
    },
    {
      id: "payment",
      icon: <CreditCard className="h-4 w-4" />,
      title: t("templatePayment"),
      text: t("templatePaymentText"),
      description: t("templatePaymentDesc"),
      priority: 3,
    },
    {
      id: "reading",
      icon: <BookOpen className="h-4 w-4" />,
      title: t("templateReading"),
      text: t("templateReadingText"),
      description: t("templateReadingDesc"),
      priority: 1,
    },
    {
      id: "appointment",
      icon: <Stethoscope className="h-4 w-4" />,
      title: t("templateAppointment"),
      text: t("templateAppointmentText"),
      description: t("templateAppointmentDesc"),
      priority: 2,
    },
    {
      id: "work",
      icon: <Briefcase className="h-4 w-4" />,
      title: t("templateWork"),
      text: t("templateWorkText"),
      description: t("templateWorkDesc"),
      priority: 2,
    },
    {
      id: "workout",
      icon: <Dumbbell className="h-4 w-4" />,
      title: t("templateWorkout"),
      text: t("templateWorkoutText"),
      description: t("templateWorkoutDesc"),
      priority: 1,
    },
    {
      id: "travel",
      icon: <Plane className="h-4 w-4" />,
      title: t("templateTravel"),
      text: t("templateTravelText"),
      description: t("templateTravelDesc"),
      priority: 2,
    },
    {
      id: "gift",
      icon: <Gift className="h-4 w-4" />,
      title: t("templateGift"),
      text: t("templateGiftText"),
      description: t("templateGiftDesc"),
      priority: 2,
    },
    {
      id: "repair",
      icon: <Wrench className="h-4 w-4" />,
      title: t("templateRepair"),
      text: t("templateRepairText"),
      description: t("templateRepairDesc"),
      priority: 2,
    },
    {
      id: "study",
      icon: <FileText className="h-4 w-4" />,
      title: t("templateStudy"),
      text: t("templateStudyText"),
      description: t("templateStudyDesc"),
      priority: 2,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-muted-foreground">
        {t("taskTemplates")}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              "border hover:bg-accent hover:border-primary/30",
              selectedId === template.id
                ? "bg-primary/10 border-primary/50 text-primary"
                : "bg-background border-border text-foreground"
            )}
          >
            <span className="text-muted-foreground">{template.icon}</span>
            <span className="truncate">{template.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

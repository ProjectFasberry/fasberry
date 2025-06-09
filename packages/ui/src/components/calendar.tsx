import { DayPicker } from "react-day-picker";
import { cn } from "@repo/lib/utils/ui/cn.ts";
import { ComponentProps } from "react";
import { ru } from "react-day-picker/locale";

export type CalendarProps = ComponentProps<typeof DayPicker>;

const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) => {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={ru}
      classNames={{
        dropdowns: "flex w-full gap-2",
        months: "flex w-full h-fit",
        month: "flex flex-col w-full",
        month_caption: "hidden",
        caption_label: "text-[16px] font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: "hidden",
        button_next: "hidden",
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mt-2",
        weekday: "text-shark-50 rounded-md w-9 font-normal text-[17px]",
        week: "flex w-full justify-between mt-2",
        day:
          "h-9 w-9 text-center text-[16px] p-0 relative flex" +
          " items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md" +
          " [&:has([aria-selected].day-outside)]:bg-shark-400/50 [&:has([aria-selected])]:bg-shark-400 " +
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1",
        day_button: cn(
          "size-9 rounded-md p-0 font-normal aria-selected:opacity-100",
        ),
        range_end: "day-range-end",
        selected:
          "bg-emerald-500/50 text-shark-50 hover:bg-primary hover:text-shark-100" +
          " focus:bg-emerald-500/30 focus:text-shark-100 rounded-l-md rounded-r-md",
        today: "bg-shark-100/10 text-shark-50 rounded-md",
        outside:
          "day-outside text-shark-300 opacity-50 aria-selected:bg-emerald-500/60 aria-selected:text-shark-100 aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-shark-200 aria-selected:text-shark-50",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
};

Calendar.displayName = "Calendar";

export { Calendar };

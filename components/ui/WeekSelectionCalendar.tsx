import React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange, DayPicker, rangeIncludesDate } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { endOfWeek, getWeekIdentifier, startOfWeek } from "@/lib/date";
import { cn } from "@/lib/utils";

interface WeekSelectionCalendarProps {
  weeks: string[];
  onWeekChange: (date: Date | undefined) => void;
}

const WeekSelectionCalendar: React.FC<WeekSelectionCalendarProps> = ({
  weeks,
  onWeekChange,
}) => {
  const [selectedWeekRange, setSelectedWeekRange] = React.useState<DateRange>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });

  const handleWeekClick = (day: Date) => {
    if (day) {
      onWeekChange(startOfWeek(day));
      setSelectedWeekRange({
        from: startOfWeek(day),
        to: endOfWeek(day),
      });
    }
  };

  const isWeekDisabled = (date: Date) => {
    const week = getWeekIdentifier(date);    
    return !weeks.includes(week);
  };

  return (
    <DayPicker
      mode="single"
      modifiers={{
        selected: selectedWeekRange,
        range_start: selectedWeekRange.from,
        range_end: selectedWeekRange.to,
        range_middle: (date: Date) =>
          rangeIncludesDate(selectedWeekRange, date, true),
        disabled: isWeekDisabled,
      }}
      onDayClick={handleWeekClick}
      className=""
      classNames={{
        months: "relative flex flex-col",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-1 top-0",
          "z-10"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-1 top-0",
          "z-10"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "relative p-0 rounded-md text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected])]:rounded-md",
          "h-8 w-8 mx-0.5"
        ),
        day_button: "font-normal aria-selected:opacity-100",
        range_start: "rounded-r-none",
        range_end: "rounded-l-none",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none !w-9 !mx-0",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ className, ...props }) => {
          if (props.orientation === "left") {
            return (
              <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
            );
          }
          return (
            <ChevronRight className={cn("h-4 w-4", className)} {...props} />
          );
        },
      }}
    />
  );
};

export default WeekSelectionCalendar;

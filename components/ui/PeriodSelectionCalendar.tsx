import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { DateRange, DayPicker, rangeIncludesDate } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { endOfWeek, getWeekIdentifier, startOfWeek } from "@/lib/date";
import { cn } from "@/lib/utils";
import { Period, View } from "@/store/dataSlice";
import { MonthPicker } from "@/components/ui/month-picker";
import { YearPicker } from "@/components/ui/year-picker";

interface PeriodSelectionCalendarProps {
  periods: Period[];
  onPeriodChange: (date: Date) => void;
  view: View;
}

const PeriodSelectionCalendar: React.FC<PeriodSelectionCalendarProps> = ({
  periods,
  onPeriodChange,
  view,
}) => {
  const [selectedPeriodRange, setSelectedPeriodRange] = useState<DateRange>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [month, setMonth] = useState(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });

  const handlePeriodClick = useCallback(
    (day: Date) => {
      if (view === View.Weekly) {
        onPeriodChange(startOfWeek(day));
        setSelectedPeriodRange({
          from: startOfWeek(day),
          to: endOfWeek(day),
        });
      } else {
        onPeriodChange(day);
        setSelectedPeriodRange({
          from: day,
          to: day,
        });
      }
    },
    [onPeriodChange, view]
  );

  const isPeriodDisabled = useCallback(
    (date: Date) => {
      const period = periods.find((p) => p.value === getWeekIdentifier(date));
      return !period;
    },
    [periods]
  );

  useEffect(() => {
    setSelectedPeriodRange((old) => {
      const from = old.from ?? new Date();
      const to = old.to ?? new Date();

      if (view === View.Daily) {
        if (from.getDate() > to.getDate()) {
          if (from.getMonth() === month.getMonth()) {
            return {
              from,
              to: from,
            };
          }

          const startOfMonth = new Date(
            month.getFullYear(),
            month.getMonth(),
            1,
            0,
            0,
            0,
            0
          );

          return {
            from: startOfMonth,
            to: startOfMonth,
          };
        }

        return {
          from,
          to: from,
        };
      } else if (view === View.Weekly) {
        return {
          from: startOfWeek(from),
          to: endOfWeek(to),
        };
      } else if (view === View.Monthly) {
        if (from.getMonth() !== month.getMonth()) {
          return {
            from: new Date(month.getFullYear(), month.getMonth(), 1),
            to: new Date(month.getFullYear(), month.getMonth() + 1, 0),
          };
        }

        return {
          from,
          to: from,
        };
      } else if (view === View.Yearly) {
        if (from.getFullYear() !== month.getFullYear()) {
          return {
            from: new Date(month.getFullYear(), 0, 1),
            to: new Date(month.getFullYear(), 11, 31),
          };
        }

        return {
          from,
          to: from,
        };
      }

      return {
        from,
        to: from,
      };
    });
    if (view === View.Monthly || view === View.Yearly) {
      handlePeriodClick(month);
    }
  }, [view, month, handlePeriodClick]);

  if (view === View.Yearly) {
    return (
      <YearPicker className="w-[252px]" date={month} onYearChange={setMonth} />
    );
  }

  if (view === View.Monthly) {
    return (
      <MonthPicker
        className="w-[252px]"
        date={month}
        onMonthChange={setMonth}
      />
    );
  }

  return (
    <DayPicker
      required
      showOutsideDays
      mode="single"
      selected={selectedPeriodRange.from}
      modifiers={{
        selected: selectedPeriodRange,
        range_start: selectedPeriodRange.from,
        range_end: selectedPeriodRange.to,
        range_middle: (date: Date) =>
          rangeIncludesDate(selectedPeriodRange, date, true),
        disabled: isPeriodDisabled,
      }}
      month={month}
      onMonthChange={setMonth}
      onSelect={handlePeriodClick}
      className="flex justify-center"
      classNames={{
        months: "relative flex flex-col max-w-max",
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
          "transition-none"
        ),
        day_button: "font-normal aria-selected:opacity-100 w-9 h-9",
        range_start: cn(
          view === View.Weekly && "rounded-r-none",
          "data-[outside]:bg-accent/70 data-[outside]:text-muted-foreground data-[outside]:opacity-70"
        ),
        range_end: cn(view === View.Weekly && "rounded-l-none"),
        selected: cn(
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
        ),
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-none !mx-0",
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

export default PeriodSelectionCalendar;

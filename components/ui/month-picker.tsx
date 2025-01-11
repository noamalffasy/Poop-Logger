import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  className?: string;
  date: Date;
  onMonthChange: (date: Date) => void;
}

export function MonthPicker({
  className,
  date,
  onMonthChange,
}: MonthPickerProps) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(date);
    newDate.setMonth(monthIndex);
    onMonthChange(newDate);
  };

  const handleYearChange = (delta: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(currentYear + delta);
    onMonthChange(newDate);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex justify-around items-center gap-2 w-full h-full">
        <Button
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          variant="outline"
          size="icon"
          onClick={() => handleYearChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[60px] text-center">{currentYear}</span>
        <Button
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          variant="outline"
          size="icon"
          onClick={() => handleYearChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 w-full gap-1">
        {months.map((month, i) => (
          <Button
            className={cn(
              currentMonth === i &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              "w-full"
            )}
            variant="ghost"
            onClick={() => handleMonthChange(months.indexOf(month))}
            key={month}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );
}

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface YearPickerProps {
  className?: string;
  date: Date;
  onYearChange: (date: Date) => void;
}

export function YearPicker({ className, date, onYearChange }: YearPickerProps) {
  const currentYear = date.getFullYear();

  const currentDecade = React.useMemo(
    () => currentYear - (currentYear % 10),
    [currentYear]
  );
  const years = React.useMemo(
    () => Array.from({ length: 10 }, (_, i) => currentDecade + i),
    [currentDecade]
  );

  const handleYearChange = (year: number) => {
    const newDate = new Date(date);
    newDate.setFullYear(year);
    onYearChange(newDate);
  };

  const handleDecadeChange = (delta: number) => {
    const newDate = new Date(currentDecade);
    newDate.setFullYear(currentDecade + delta);
    onYearChange(newDate);
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex justify-around items-center gap-2 w-full h-full">
        <Button
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          variant="outline"
          size="icon"
          onClick={() => handleDecadeChange(-10)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[60px] text-center">{currentDecade}-{currentDecade+9}</span>
        <Button
          className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          variant="outline"
          size="icon"
          onClick={() => handleDecadeChange(10)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 w-full gap-1">
        {years.map((year) => (
          <Button
            className={cn(
              currentYear === year &&
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              "w-full"
            )}
            variant="ghost"
            onClick={() => handleYearChange(year)}
            key={year}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}

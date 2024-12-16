import { useCallback, useMemo } from "react";

import WeekSelectionCalendar from "@/components/ui/WeekSelectionCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeekIdentifier } from "@/lib/date";
import { handleDateChange } from "@/lib/handleDateChange";
import { Period, PeriodType } from "@/store/dataSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const WeekSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.data.data);
  const selectedView = useAppSelector((state) => state.data.selectedView);

  const periods = useMemo(() => {
    if (data) {
      return data.map(
        (key) =>
          ({
            type: PeriodType.Week,
            value: getWeekIdentifier(new Date(key.timestamp)),
          } as Period)
      );
    }
    return [];
  }, [data]);

  const handleDateChangeCallback = useCallback(
    (date: Date) => handleDateChange(date, data, selectedView, dispatch),
    [data, dispatch, selectedView]
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Period Selection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center">
        <WeekSelectionCalendar
          view={selectedView}
          periods={periods}
          onPeriodChange={handleDateChangeCallback}
        />
      </CardContent>
    </Card>
  );
};

export default WeekSelection;

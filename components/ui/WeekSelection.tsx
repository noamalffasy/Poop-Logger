import { useCallback, useMemo } from "react";

import WeekSelectionCalendar from "@/components/ui/WeekSelectionCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeekIdentifier } from "@/lib/date";
import { setSelectedWeek } from "@/store/dataSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const WeekSelection: React.FC = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.data.data);

  const weeks = useMemo(() => {
    if (data) {
      return Object.keys(data);
    }
    return [];
  }, [data]);

  const handleWeekChange = useCallback(
    (date: Date | undefined) => {
      if (date && data) {
        const week = getWeekIdentifier(date);
        dispatch(setSelectedWeek(week));
      }
    },
    [data, dispatch]
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Week Selection</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center">
        <WeekSelectionCalendar weeks={weeks} onWeekChange={handleWeekChange} />
      </CardContent>
    </Card>
  );
};

export default WeekSelection;

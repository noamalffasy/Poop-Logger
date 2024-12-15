import { Frown } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WeekdayChart from "@/components/ui/WeekdayChart";
import { useAppSelector } from "@/store/hooks";

const WeekdayChartCard: React.FC = () => {
  const data = useAppSelector((state) => state.data.data);
  const selectedWeek = useAppSelector((state) => state.data.selectedWeek);

  const weeklyData = useMemo(() => {
    if (data && data[selectedWeek]) {
      return data[selectedWeek];
    }
    return {};
  }, [data, selectedWeek]);

  const hasData = useMemo(() => {
    if (weeklyData) {
      return Object.keys(weeklyData).some((key) => weeklyData[key] > 0);
    }
    return false;
  }, [weeklyData]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Weekday Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        {hasData ? (
          <WeekdayChart data={weeklyData!} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Frown className="mx-auto mb-4 h-12 w-12" />
            <p>No data available for the selected week.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekdayChartCard;

import { Frown } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimePeriodChartWrapper from "@/components/ui/TimePeriodChartWrapper";
import { useAppSelector } from "@/store/hooks";
import { formatData } from "@/lib/chartDataFormatter";
import type { ProcessedData } from "@/store/dataSlice";

const TimePeriodChartCard: React.FC = () => {
  const data = useAppSelector((state) => state.data.data);
  const selectedWeek = useAppSelector((state) => state.data.selectedWeek);
  const selectedDate = new Date(); // Replace with actual selected date from WeekSelectionCalendar

  const formattedData = useMemo(() => {
    if (data) {
      return {
        daily: formatData(data, "daily", selectedDate),
        weekly: formatData(data, "weekly", selectedDate),
        monthly: formatData(data, "monthly", selectedDate),
        yearly: formatData(data, "yearly", selectedDate),
      };
    }
    return {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
    };
  }, [data, selectedDate]);

  const hasData = useMemo(() => {
    return Object.values(formattedData).some((viewData) => viewData.length > 0);
  }, [formattedData]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Mega Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        {hasData ? (
          <Tabs defaultValue="weekly" className="flex flex-col w-full h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value="daily" className="h-full">
              <TimePeriodChartWrapper data={formattedData.daily} view="daily" selectedDate={selectedDate} />
            </TabsContent>
            <TabsContent value="weekly" className="h-full">
              <TimePeriodChartWrapper data={formattedData.weekly} view="weekly" selectedDate={selectedDate} />
            </TabsContent>
            <TabsContent value="monthly" className="h-full">
              <TimePeriodChartWrapper data={formattedData.monthly} view="monthly" selectedDate={selectedDate} />
            </TabsContent>
            <TabsContent value="yearly" className="h-full">
              <TimePeriodChartWrapper data={formattedData.yearly} view="yearly" selectedDate={selectedDate} />
            </TabsContent>
          </Tabs>
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

export default TimePeriodChartCard;

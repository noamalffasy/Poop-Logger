import { Frown } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimePeriodChartWrapper from "@/components/ui/TimePeriodChartWrapper";
import { formatData } from "@/lib/chartDataFormatter";
import { startOfWeek } from "@/lib/date";
import { Period, PeriodType, setSelectedView, View } from "@/store/dataSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const getSelectedDate = (selectedPeriod: Period): Date => {
  switch (selectedPeriod.type) {
    case PeriodType.Day:
      return new Date(selectedPeriod.value);
    case PeriodType.Week:
      return startOfWeek(new Date(selectedPeriod.value));
    case PeriodType.Month:
      return new Date(`${selectedPeriod.value}-01`);
    case PeriodType.Year:
      return new Date(`${selectedPeriod.value}-01-01`);
    default:
      return new Date();
  }
};

const TimePeriodChartCard: React.FC = () => {
  const data = useAppSelector((state) => state.data.data);
  const selectedPeriod = useAppSelector((state) => state.data.selectedPeriod);
  const selectedView = useAppSelector((state) => state.data.selectedView);
  const dispatch = useAppDispatch();
  const selectedDate = getSelectedDate(selectedPeriod);

  const formattedData = useMemo(() => {
    if (data) {
      return {
        daily: formatData(data, View.Daily, selectedDate),
        weekly: formatData(data, View.Weekly, selectedDate),
        monthly: formatData(data, View.Monthly, selectedDate),
        yearly: formatData(data, View.Yearly, selectedDate),
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

  const handleViewChange = (view: View) => {
    dispatch(setSelectedView(view));
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Mega Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center">
        {hasData ? (
          <Tabs
            defaultValue={selectedView}
            onValueChange={(data) => handleViewChange(data as View)}
            className="flex flex-col w-full h-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value={View.Daily}>Daily</TabsTrigger>
              <TabsTrigger value={View.Weekly}>Weekly</TabsTrigger>
              <TabsTrigger value={View.Monthly}>Monthly</TabsTrigger>
              <TabsTrigger value={View.Yearly}>Yearly</TabsTrigger>
            </TabsList>
            <TabsContent value={View.Daily} className="h-full min-h-0">
              <TimePeriodChartWrapper
                data={formattedData.daily}
                view={View.Daily}
                selectedDate={selectedDate}
              />
            </TabsContent>
            <TabsContent value={View.Weekly} className="h-full min-h-0">
              <TimePeriodChartWrapper
                data={formattedData.weekly}
                view={View.Weekly}
                selectedDate={selectedDate}
              />
            </TabsContent>
            <TabsContent value={View.Monthly} className="h-full min-h-0">
              <TimePeriodChartWrapper
                data={formattedData.monthly}
                view={View.Monthly}
                selectedDate={selectedDate}
              />
            </TabsContent>
            <TabsContent value={View.Yearly} className="h-full min-h-0">
              <TimePeriodChartWrapper
                data={formattedData.yearly}
                view={View.Yearly}
                selectedDate={selectedDate}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Frown className="mx-auto mb-4 h-12 w-12" />
            <p>No data available for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimePeriodChartCard;

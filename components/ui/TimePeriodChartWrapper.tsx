import { Frown } from "lucide-react";
import TimePeriodChart from "@/components/ui/TimePeriodChart";
import type { ProcessedData } from "@/store/dataSlice";

interface TimePeriodChartWrapperProps {
  data: { key: string; value: number }[];
  view: "yearly" | "monthly" | "weekly" | "daily";
  selectedDate: Date;
}

const getViewName = (view: string) => {
  switch (view) {
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "yearly":
      return "year";
    default:
      return "view";
  }
};

const TimePeriodChartWrapper: React.FC<TimePeriodChartWrapperProps> = ({ data, view, selectedDate }) => {
  const hasData = data.length > 0;
  const viewName = getViewName(view);

  return (
    <div className="h-full flex items-center justify-center">
      {hasData ? (
        <TimePeriodChart data={data} view={view} selectedDate={selectedDate} />
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Frown className="mx-auto mb-4 h-12 w-12" />
          <p>No data available for the selected {viewName}.</p>
        </div>
      )}
    </div>
  );
};

export default TimePeriodChartWrapper;

import TimePeriodChart from "@/components/ui/TimePeriodChart";
import { View } from "@/store/dataSlice";
import { Frown } from "lucide-react";

interface TimePeriodChartWrapperProps {
  data: { key: string; value: number }[];
  view: View;
}

const getViewName = (view: View) => {
  switch (view) {
    case View.Daily:
      return "day";
    case View.Weekly:
      return "week";
    case View.Monthly:
      return "month";
    case View.Yearly:
      return "year";
    default:
      return "view";
  }
};

const TimePeriodChartWrapper: React.FC<TimePeriodChartWrapperProps> = ({
  data,
  view,
}) => {
  const hasData = data.length > 0;
  const viewName = getViewName(view);

  return (
    <div className="h-full flex items-center justify-center">
      {hasData ? (
        <TimePeriodChart data={data} view={view} />
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

import { Frown } from "lucide-react";
import { useMemo } from "react";

import TimePeriodChart from "@/components/ui/TimePeriodChart";
import { getNumPossibleEntries, formatTick } from "@/lib/chartDataFormatter";
import { View } from "@/store/dataSlice";

interface TimePeriodChartWrapperProps {
  data: { key: string; value: number }[];
  view: View;
  selectedDate: Date;
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
  selectedDate,
}) => {
  const hasData = data.length > 0;
  const viewName = getViewName(view);

  const filledData = useMemo(() => {
    const newData: typeof data = [];
    const numPossibleEntries = getNumPossibleEntries(view, selectedDate);

    for (let i = 0; i < numPossibleEntries; i++) {
      const entry = data.find((e) => e.key === `${i}`);

      if (entry) {
        newData.push({
          key: formatTick(entry.key, view),
          value: entry.value,
        });
      } else {
        newData.push({ key: formatTick(`${i}`, view), value: 0 });
      }
    }

    return newData;
  }, [data, view, selectedDate]);

  return (
    <div className="h-full flex items-center justify-center">
      {hasData ? (
        <TimePeriodChart data={filledData} />
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

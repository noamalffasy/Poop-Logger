import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { View } from "@/store/dataSlice";

interface TimePeriodChartProps {
  data: { key: string; value: number }[];
  view: View;
  selectedDate: Date;
}

export default function TimePeriodChart({
  data,
  view,
  selectedDate,
}: TimePeriodChartProps) {
  const chartData = data;

  const getTickFormatter = (value: string) => {
    switch (view) {
      case View.Yearly:
        return new Date(0, parseInt(value)).toLocaleString("default", {
          month: "short",
        });
      case View.Monthly:
        return value; // Day of the month
      case View.Weekly:
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          parseInt(value)
        ];
      case View.Daily:
        return `${value}:00`; // Hour of the day
      default:
        return value;
    }
  };

  return (
    <ChartContainer
      config={{
        entries: {
          label: "Number of entries",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={chartData} layout="vertical">
          <CartesianGrid vertical={false} />
          <XAxis type="number" dataKey="value" hide />
          <YAxis
            dataKey="key"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={getTickFormatter}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

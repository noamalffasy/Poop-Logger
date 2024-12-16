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
import type { ProcessedData } from "@/store/dataSlice";

interface WeekdayChartProps {
  data: ProcessedData[string];
  view: "yearly" | "monthly" | "weekly" | "daily";
}

export default function WeekdayChart({ data, view }: WeekdayChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }));

  const getTickFormatter = (value: string) => {
    switch (view) {
      case "yearly":
        return value.slice(0, 4); // Year
      case "monthly":
        return value.slice(0, 7); // Year-Month
      case "weekly":
        return value.slice(0, 3); // Year-Month-Day (start of week)
      case "daily":
        return value.slice(0, 10); // Year-Month-Day
      default:
        return value;
    }
  };

  return (
    <ChartContainer
      config={{
        entries: {
          label: "Number of breaks",
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

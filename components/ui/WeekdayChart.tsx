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
}

export default function WeekdayChart({ data }: WeekdayChartProps) {
  const chartData = Object.entries(data).map(([day, value]) => ({
    day,
    value,
  }));

  console.log(chartData);

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
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

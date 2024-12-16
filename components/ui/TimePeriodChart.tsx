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

interface TimePeriodChartProps {
  data: { key: string; value: number }[];
}

export default function TimePeriodChart({ data }: TimePeriodChartProps) {
  const chartData = data;

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
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

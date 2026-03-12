"use client";

import {
  ChartContainer,
  type ChartConfig,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  accuracy: {
    label: "accuracy",
    color: "#00BB79",
  },
  progress: {
    label: "progress",
    color: "#FB9400",
  },
} satisfies ChartConfig;

export function ChartExample({
  subjectWiseAccuracyAndProgress,
}: {
  subjectWiseAccuracyAndProgress: { subject: string; accuracy: number; progress: number }[];
}) {
  // Transform the subject-wise accuracy and progress data into the format expected by the chart
  const chartData = subjectWiseAccuracyAndProgress.map((item) => ({
    subject: item.subject,
    accuracy: item.accuracy,
    progress: item.progress,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-full w-full cursor-pointer">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="subject"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} />
        <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

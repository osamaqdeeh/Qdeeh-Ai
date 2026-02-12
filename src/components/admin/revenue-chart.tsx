"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  createdAt: Date;
}

interface RevenueChartProps {
  data: Payment[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Group payments by date
  const groupedData = data.reduce((acc, payment) => {
    const date = new Date(payment.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += payment.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedData)
    .map(([date, amount]) => ({
      date,
      revenue: amount,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
          className="text-xs"
        />
        <YAxis
          tickFormatter={(value) => `$${value.toFixed(0)}`}
          className="text-xs"
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

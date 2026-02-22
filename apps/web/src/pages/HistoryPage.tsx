import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";

const palette = [
  "#38bdf8",
  "#facc15",
  "#34d399",
  "#fb7185",
  "#c084fc",
  "#f97316",
];

export function HistoryPage() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const historyQuery = useQuery({
    queryKey: ["history", month],
    queryFn: () => api.getHistory(month),
  });

  const chartData = useMemo(() => {
    if (!historyQuery.data) return [];

    return historyQuery.data.daily.map((day) => {
      const record: Record<string, string | number> = {
        date: day.date.slice(8),
        main: day.mainAp,
      };
      historyQuery.data?.categories.forEach((category) => {
        record[category.id] = day.categoryAp[category.id] ?? 0;
      });
      return record;
    });
  }, [historyQuery.data]);

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Monthly History</h2>
        <input
          className="input max-w-40"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {historyQuery.isLoading ? <p>Loading history...</p> : null}
      {historyQuery.error ? (
        <p className="text-red-300">Could not load history.</p>
      ) : null}

      {historyQuery.data ? (
        <div className="h-[380px] w-full">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
            >
              <XAxis dataKey="date" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="main"
                stroke="#f8fafc"
                strokeWidth={2}
                dot={false}
              />
              {historyQuery.data.categories.map((category, index) => (
                <Line
                  key={category.id}
                  type="monotone"
                  dataKey={category.id}
                  name={category.name}
                  stroke={palette[index % palette.length]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}

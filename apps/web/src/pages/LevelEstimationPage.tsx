import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function LevelEstimationPage() {
  const estimationQuery = useQuery({
    queryKey: ["level-estimation"],
    queryFn: api.getLevelEstimation,
  });

  if (estimationQuery.isLoading)
    return <div className="card">Loading level estimation...</div>;
  if (estimationQuery.error)
    return <div className="card text-red-300">Failed to load estimations.</div>;
  if (!estimationQuery.data)
    return <div className="card">No level estimation available.</div>;

  return (
    <section className="card">
      <h2 className="mb-4 text-xl font-semibold">Level Estimation</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="py-2">Level Range</th>
              <th className="py-2">Total XP/AP Needed</th>
              <th className="py-2">Estimated Consistent Days</th>
            </tr>
          </thead>
          <tbody>
            {estimationQuery.data.map((row) => (
              <tr
                key={`${row.from}-${row.to}`}
                className="border-t border-slate-800"
              >
                <td className="py-2">
                  {row.from} - {row.to}
                </td>
                <td className="py-2">{row.totalXp}</td>
                <td className="py-2">{row.estimatedDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

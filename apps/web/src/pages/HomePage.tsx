import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

function MetricIcon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomePage() {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
  });

  const logMutation = useMutation({
    mutationFn: api.createLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });

  if (dashboardQuery.isLoading)
    return <div className="card">Loading dashboard...</div>;
  if (dashboardQuery.error)
    return <div className="card text-red-300">Failed to load dashboard.</div>;
  if (!dashboardQuery.data)
    return <div className="card">No dashboard data yet.</div>;

  const data = dashboardQuery.data;

  return (
    <section className="space-y-4">
      <div className="card card-accent">
        <p className="text-slate-400">Player</p>
        <h2 className="text-2xl font-semibold text-cyan-100">{data.playerName}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <MetricIcon path="M3 17h18M7 13l3 3 7-7" />
              Main Level
            </p>
            <p className="text-3xl font-bold text-cyan-100">{data.main.level}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <MetricIcon path="M12 3v18M6 12h12" />
              Main AP
            </p>
            <p className="text-3xl font-bold text-emerald-300">{data.main.totalAp}</p>
          </div>
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <MetricIcon path="M4 16l5-5 4 4 7-7" />
              Progress
            </p>
            <p className="text-3xl font-bold text-violet-200">
              {data.main.xpIntoLevel} / {data.main.nextLevelXp}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.categories.map((category) => (
          <div className="card space-y-3" key={category.id}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{category.name}</h3>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-200">
                Level {category.level}
              </span>
            </div>
            <p className="text-sm text-slate-300">
              AP: {category.totalAp} · Progress: {category.xpIntoLevel}/
              {category.nextLevelXp}
            </p>
            <div className="space-y-2">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  className={`btn w-full text-left ${
                    item.ap >= 0 ? "btn-positive" : "btn-penalty"
                  }`}
                  onClick={() =>
                    logMutation.mutate({
                      date: dayjs().format("YYYY-MM-DD"),
                      categoryId: category.id,
                      itemId: item.id,
                      label: item.label,
                      ap: item.ap,
                      type: item.ap >= 0 ? "positive" : "penalty",
                    })
                  }
                >
                  <span className="mr-2 inline-flex align-middle text-slate-300">
                    <MetricIcon path={item.ap >= 0 ? "M12 5v14M5 12h14" : "M5 12h14"} />
                  </span>
                  {item.label} ({item.ap > 0 ? "+" : ""}
                  {item.ap} AP)
                </button>
              ))}
            </div>
            {data.today?.categoryAutoBreakdown[category.id] ? (
              <p className="text-xs text-slate-500">
                Today auto: streak{" "}
                {data.today.categoryAutoBreakdown[category.id].streakBonus >= 0
                  ? "+"
                  : ""}
                {data.today.categoryAutoBreakdown[category.id].streakBonus}, gym
                penalty{" "}
                {data.today.categoryAutoBreakdown[category.id].autoPenalty}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

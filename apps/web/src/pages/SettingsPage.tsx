import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { AppConfig } from "../lib/types";

const uid = () => Math.random().toString(36).slice(2, 10);

export function SettingsPage() {
  const queryClient = useQueryClient();
  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: api.getConfig,
  });
  const [draft, setDraft] = useState<AppConfig | null>(null);

  const config = useMemo(
    () => draft ?? configQuery.data ?? null,
    [draft, configQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: api.saveConfig,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["config"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["level-estimation"] }),
      ]);
      setDraft(null);
    },
  });

  if (configQuery.isLoading)
    return <div className="card">Loading settings...</div>;
  if (configQuery.error || !config)
    return <div className="card text-red-300">Failed to load settings.</div>;

  const updateConfig = (next: AppConfig) => setDraft(next);

  return (
    <section className="space-y-4">
      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">General Settings</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span>Player Name</span>
            <input
              className="input"
              value={config.playerName}
              onChange={(event) =>
                updateConfig({ ...config, playerName: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Gym Auto Penalty AP</span>
            <input
              className="input"
              type="number"
              value={config.gymAutoPenaltyAp}
              onChange={(event) =>
                updateConfig({
                  ...config,
                  gymAutoPenaltyAp: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Base XP Per Level</span>
            <input
              className="input"
              type="number"
              value={config.leveling.baseXpPerLevel}
              onChange={(event) =>
                updateConfig({
                  ...config,
                  leveling: {
                    ...config.leveling,
                    baseXpPerLevel: Number(event.target.value),
                  },
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span>Growth Rate</span>
            <input
              className="input"
              type="number"
              step="0.01"
              value={config.leveling.growthRate}
              onChange={(event) =>
                updateConfig({
                  ...config,
                  leveling: {
                    ...config.leveling,
                    growthRate: Number(event.target.value),
                  },
                })
              }
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {config.categories.map((category) => (
          <div className="card space-y-3" key={category.id}>
            <div className="flex gap-2">
              <input
                className="input"
                value={category.name}
                onChange={(event) =>
                  updateConfig({
                    ...config,
                    categories: config.categories.map((item) =>
                      item.id === category.id
                        ? { ...item, name: event.target.value }
                        : item,
                    ),
                  })
                }
              />
              <button
                className="btn"
                onClick={() =>
                  updateConfig({
                    ...config,
                    categories: config.categories.filter(
                      (item) => item.id !== category.id,
                    ),
                  })
                }
              >
                Delete Category
              </button>
            </div>
            <label className="space-y-1 text-sm">
              <span>Daily Streak Bonus AP</span>
              <input
                className="input"
                type="number"
                value={category.streakBonusAp}
                onChange={(event) =>
                  updateConfig({
                    ...config,
                    categories: config.categories.map((item) =>
                      item.id === category.id
                        ? { ...item, streakBonusAp: Number(event.target.value) }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <div className="space-y-2">
              {category.items.map((item) => (
                <div
                  className="grid gap-2 md:grid-cols-[1fr_120px_120px]"
                  key={item.id}
                >
                  <input
                    className="input"
                    value={item.label}
                    onChange={(event) =>
                      updateConfig({
                        ...config,
                        categories: config.categories.map((c) =>
                          c.id === category.id
                            ? {
                                ...c,
                                items: c.items.map((i) =>
                                  i.id === item.id
                                    ? { ...i, label: event.target.value }
                                    : i,
                                ),
                              }
                            : c,
                        ),
                      })
                    }
                  />
                  <input
                    className="input"
                    type="number"
                    value={item.ap}
                    onChange={(event) =>
                      updateConfig({
                        ...config,
                        categories: config.categories.map((c) =>
                          c.id === category.id
                            ? {
                                ...c,
                                items: c.items.map((i) =>
                                  i.id === item.id
                                    ? { ...i, ap: Number(event.target.value) }
                                    : i,
                                ),
                              }
                            : c,
                        ),
                      })
                    }
                  />
                  <button
                    className="btn"
                    onClick={() =>
                      updateConfig({
                        ...config,
                        categories: config.categories.map((c) =>
                          c.id === category.id
                            ? {
                                ...c,
                                items: c.items.filter((i) => i.id !== item.id),
                              }
                            : c,
                        ),
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                className="btn"
                onClick={() =>
                  updateConfig({
                    ...config,
                    categories: config.categories.map((item) =>
                      item.id === category.id
                        ? {
                            ...item,
                            items: [
                              ...item.items,
                              {
                                id: `${category.id}-${uid()}`,
                                label: "New Item",
                                ap: 10,
                              },
                            ],
                          }
                        : item,
                    ),
                  })
                }
              >
                Add Item
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn"
        onClick={() =>
          updateConfig({
            ...config,
            categories: [
              ...config.categories,
              { id: uid(), name: "New Category", streakBonusAp: 10, items: [] },
            ],
          })
        }
      >
        Add Category
      </button>

      <button className="btn" onClick={() => saveMutation.mutate(config)}>
        Save Settings
      </button>
    </section>
  );
}

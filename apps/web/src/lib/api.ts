import {
  AppConfig,
  DashboardData,
  Goal,
  HistoryData,
  LevelEstimate,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

export const api = {
  getDashboard: () => request<DashboardData>("/api/dashboard"),
  getConfig: () => request<AppConfig>("/api/config"),
  saveConfig: (config: AppConfig) =>
    request<AppConfig>("/api/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),
  createLog: (payload: {
    date: string;
    categoryId: string;
    itemId: string;
    label: string;
    ap: number;
    type: "positive" | "penalty";
  }) =>
    request("/api/logs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getGoals: () => request<Goal[]>("/api/goals"),
  addGoal: (text: string) =>
    request<Goal>("/api/goals", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
  deleteGoal: (id: string) =>
    request<{ ok: true }>(`/api/goals/${id}`, {
      method: "DELETE",
    }),
  getHistory: (month: string) =>
    request<HistoryData>(`/api/history?month=${month}`),
  getLevelEstimation: () => request<LevelEstimate[]>("/api/level-estimation"),
};

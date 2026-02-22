import { randomUUID } from "node:crypto";
import dayjs from "dayjs";
import { db } from "../lib/firestore.js";
import { DEFAULT_CONFIG } from "../lib/defaultConfig.js";
import { AppConfig, Goal, LogEntry } from "../types.js";

const memoryStore: {
  config: AppConfig;
  logs: LogEntry[];
  goals: Goal[];
} = {
  config: DEFAULT_CONFIG,
  logs: [],
  goals: [],
};

export const getConfig = async (): Promise<AppConfig> => {
  if (!db) return memoryStore.config;
  const ref = db.collection("app").doc("config");
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  return doc.data() as AppConfig;
};

export const updateConfig = async (config: AppConfig): Promise<AppConfig> => {
  if (!db) {
    memoryStore.config = config;
    return memoryStore.config;
  }
  await db.collection("app").doc("config").set(config);
  return config;
};

export const addLog = async (
  payload: Omit<LogEntry, "id" | "createdAt">,
): Promise<LogEntry> => {
  const log: LogEntry = {
    ...payload,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  if (!db) {
    memoryStore.logs.push(log);
    return log;
  }

  await db.collection("logs").doc(log.id).set(log);
  return log;
};

export const getLogsInRange = async (
  startDate: string,
  endDate: string,
): Promise<LogEntry[]> => {
  if (!db) {
    return memoryStore.logs.filter(
      (log) => log.date >= startDate && log.date <= endDate,
    );
  }

  const snapshot = await db
    .collection("logs")
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  return snapshot.docs.map((doc) => doc.data() as LogEntry);
};

export const getAllLogs = async (): Promise<LogEntry[]> => {
  if (!db) return memoryStore.logs;
  const snapshot = await db.collection("logs").get();
  return snapshot.docs.map((doc) => doc.data() as LogEntry);
};

export const getGoals = async (): Promise<Goal[]> => {
  if (!db) return memoryStore.goals;
  const snapshot = await db
    .collection("goals")
    .orderBy("createdAt", "desc")
    .get();
  return snapshot.docs.map((doc) => doc.data() as Goal);
};

export const addGoal = async (text: string): Promise<Goal> => {
  const goal: Goal = {
    id: randomUUID(),
    text,
    createdAt: dayjs().toISOString(),
  };

  if (!db) {
    memoryStore.goals.unshift(goal);
    return goal;
  }

  await db.collection("goals").doc(goal.id).set(goal);
  return goal;
};

export const deleteGoal = async (id: string): Promise<void> => {
  if (!db) {
    memoryStore.goals = memoryStore.goals.filter((goal) => goal.id !== id);
    return;
  }

  await db.collection("goals").doc(id).delete();
};

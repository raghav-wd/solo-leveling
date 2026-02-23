import dayjs from "dayjs";
import { AppConfig, DailySummary, LogEntry } from "../types.js";

const xpNeededForNextLevel = (level: number, config: AppConfig) => {
  const growthExponent = (level - 1) * 0.7;
  const raw =
    config.leveling.baseXpPerLevel *
    config.leveling.growthRate ** growthExponent;
  return Math.round(raw);
};

export const calculateLevel = (totalXp: number, config: AppConfig) => {
  let level = 1;
  let remaining = totalXp;

  while (remaining >= xpNeededForNextLevel(level, config)) {
    remaining -= xpNeededForNextLevel(level, config);
    level += 1;
    if (level > 5000) break;
  }

  const nextLevelXp = xpNeededForNextLevel(level, config);
  return {
    level,
    xpIntoLevel: remaining,
    nextLevelXp,
    progressRatio: Math.max(0, Math.min(1, remaining / nextLevelXp)),
  };
};

export const totalXpUntilLevel = (targetLevel: number, config: AppConfig) => {
  let total = 0;
  for (let level = 1; level < targetLevel; level += 1) {
    total += xpNeededForNextLevel(level, config);
  }
  return total;
};

export const buildDailySummaries = (
  logs: LogEntry[],
  config: AppConfig,
  startDate: string,
  endDate: string,
): DailySummary[] => {
  const logsByDate = new Map<string, LogEntry[]>();
  logs.forEach((log) => {
    const dayLogs = logsByDate.get(log.date) ?? [];
    dayLogs.push(log);
    logsByDate.set(log.date, dayLogs);
  });

  const streakByCategory: Record<string, number> = {};
  const gymMissStreak = { value: 0 };

  const summaries: DailySummary[] = [];
  let cursor = dayjs(startDate);
  const end = dayjs(endDate);

  while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
    const date = cursor.format("YYYY-MM-DD");
    const dayLogs = logsByDate.get(date) ?? [];

    const categoryAp: Record<string, number> = {};
    const categoryAutoBreakdown: Record<
      string,
      { streakBonus: number; autoPenalty: number }
    > = {};

    config.categories.forEach((category) => {
      const manual = dayLogs
        .filter((log) => log.categoryId === category.id)
        .reduce((sum, log) => sum + log.ap, 0);

      let streakBonus = 0;
      let autoPenalty = 0;

      const hasPositiveAction = manual > 0;
      if (category.streakBonusAp > 0 && hasPositiveAction) {
        streakByCategory[category.id] =
          (streakByCategory[category.id] ?? 0) + 1;
        if (streakByCategory[category.id] >= 2) {
          streakBonus = category.streakBonusAp;
        }
      } else {
        streakByCategory[category.id] = 0;
      }

      if (category.id === "gym") {
        const isRestDay = cursor.day() === config.gymRestDay;
        if (!isRestDay) {
          if (hasPositiveAction) {
            gymMissStreak.value = 0;
          } else {
            gymMissStreak.value += 1;
            if (gymMissStreak.value >= 2) {
              autoPenalty = config.gymAutoPenaltyAp;
            }
          }
        }
      }

      categoryAp[category.id] = manual + streakBonus + autoPenalty;
      categoryAutoBreakdown[category.id] = { streakBonus, autoPenalty };
    });

    const mainAp = Object.values(categoryAp).reduce(
      (sum, value) => sum + value,
      0,
    );

    summaries.push({
      date,
      categoryAp,
      categoryAutoBreakdown,
      mainAp,
    });

    cursor = cursor.add(1, "day");
  }

  return summaries;
};

export const aggregateTotals = (daily: DailySummary[]) => {
  const categoryTotals: Record<string, number> = {};
  let mainTotal = 0;

  daily.forEach((entry) => {
    mainTotal += entry.mainAp;
    Object.entries(entry.categoryAp).forEach(([categoryId, value]) => {
      categoryTotals[categoryId] = (categoryTotals[categoryId] ?? 0) + value;
    });
  });

  return { categoryTotals, mainTotal };
};

export type LogType = "positive" | "penalty";

export interface ActivityItem {
  id: string;
  label: string;
  ap: number;
}

export interface Category {
  id: string;
  name: string;
  streakBonusAp: number;
  items: ActivityItem[];
}

export interface LevelingConfig {
  baseXpPerLevel: number;
  growthRate: number;
  estimatedDailyAp: number;
}

export interface AppConfig {
  playerName: string;
  gymRestDay: number;
  gymAutoPenaltyAp: number;
  categories: Category[];
  leveling: LevelingConfig;
}

export interface LogEntry {
  id: string;
  date: string;
  categoryId: string;
  itemId: string;
  label: string;
  ap: number;
  type: LogType;
  createdAt: string;
}

export interface Goal {
  id: string;
  text: string;
  createdAt: string;
}

export interface DailySummary {
  date: string;
  categoryAp: Record<string, number>;
  categoryAutoBreakdown: Record<
    string,
    { streakBonus: number; autoPenalty: number }
  >;
  mainAp: number;
}

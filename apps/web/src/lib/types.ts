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

export interface AppConfig {
  playerName: string;
  gymRestDay: number;
  gymAutoPenaltyAp: number;
  categories: Category[];
  leveling: {
    baseXpPerLevel: number;
    growthRate: number;
    estimatedDailyAp: number;
  };
}

export interface DashboardCategory extends Category {
  totalAp: number;
  level: number;
  xpIntoLevel: number;
  nextLevelXp: number;
  progressRatio: number;
}

export interface DashboardData {
  playerName: string;
  startDate: string;
  endDate: string;
  main: {
    totalAp: number;
    level: number;
    xpIntoLevel: number;
    nextLevelXp: number;
    progressRatio: number;
  };
  categories: DashboardCategory[];
  today: {
    date: string;
    categoryAp: Record<string, number>;
    categoryAutoBreakdown: Record<
      string,
      { streakBonus: number; autoPenalty: number }
    >;
    mainAp: number;
  };
}

export interface Goal {
  id: string;
  text: string;
  createdAt: string;
}

export interface HistoryData {
  month: string;
  categories: Category[];
  daily: Array<{
    date: string;
    categoryAp: Record<string, number>;
    mainAp: number;
  }>;
}

export interface LevelEstimate {
  from: number;
  to: number;
  totalXp: number;
  estimatedDays: number;
}

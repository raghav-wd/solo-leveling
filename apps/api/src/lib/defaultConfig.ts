import { AppConfig } from "../types.js";

export const DEFAULT_CONFIG: AppConfig = {
  playerName: "Handler One",
  gymRestDay: 0,
  gymAutoPenaltyAp: -50,
  leveling: {
    baseXpPerLevel: 120,
    growthRate: 1.12,
    estimatedDailyAp: 170,
  },
  categories: [
    {
      id: "gym",
      name: "Gym",
      streakBonusAp: 10,
      items: [
        { id: "gym-light", label: "Light Workout", ap: 15 },
        { id: "gym-moderate", label: "Moderate Workout", ap: 30 },
        { id: "gym-heavy", label: "Heavy Workout", ap: 40 },
      ],
    },
    {
      id: "it-knowledge",
      name: "IT Knowledge",
      streakBonusAp: 10,
      items: [
        { id: "leetcode", label: "Solved LeetCode Problem", ap: 50 },
        { id: "learn-hour", label: "Learned Something New (1h+)", ap: 30 },
      ],
    },
    {
      id: "diet",
      name: "Diet",
      streakBonusAp: 10,
      items: [
        { id: "protein-100", label: "100g Protein", ap: 25 },
        { id: "sugary-item", label: "Ate Sugary Item", ap: -30 },
      ],
    },
    {
      id: "lifestyle",
      name: "Lifestyle",
      streakBonusAp: 10,
      items: [
        { id: "wake-before-8", label: "Wake Up Before 8 AM", ap: 20 },
        {
          id: "morning-routine-45",
          label: "Morning Routine in 45 mins",
          ap: 30,
        },
        {
          id: "curious-obsessive",
          label: "Stayed Curious & Obsessive",
          ap: 15,
        },
      ],
    },
    {
      id: "manual-penalty",
      name: "Manual Penalty",
      streakBonusAp: 0,
      items: [
        { id: "valorant", label: "Played Valorant", ap: -20 },
        { id: "doomscrolling", label: "Doomscrolled > 30 mins", ap: -30 },
      ],
    },
  ],
};

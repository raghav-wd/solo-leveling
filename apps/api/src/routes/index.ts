import { FastifyInstance } from "fastify";
import dayjs from "dayjs";
import { z } from "zod";
import {
  addGoal,
  addLog,
  deleteGoal,
  getAllLogs,
  getConfig,
  getGoals,
  getLogsInRange,
  updateConfig,
} from "../services/store.js";
import {
  aggregateTotals,
  buildDailySummaries,
  calculateLevel,
  totalXpUntilLevel,
} from "../services/progression.js";

export const registerRoutes = (app: FastifyInstance) => {
  app.get("/health", async () => ({ ok: true }));

  app.get("/api/config", async () => getConfig());

  app.put("/api/config", async (request, reply) => {
    const schema = z.object({
      playerName: z.string().min(1),
      gymRestDay: z.number().int().min(0).max(6),
      gymAutoPenaltyAp: z.number().int(),
      leveling: z.object({
        baseXpPerLevel: z.number().positive(),
        growthRate: z.number().positive(),
        estimatedDailyAp: z.number().positive(),
      }),
      categories: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          streakBonusAp: z.number().int(),
          items: z.array(
            z.object({
              id: z.string().min(1),
              label: z.string().min(1),
              ap: z.number().int(),
            }),
          ),
        }),
      ),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.flatten());

    const saved = await updateConfig(parsed.data);
    return saved;
  });

  app.post("/api/logs", async (request, reply) => {
    const schema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      categoryId: z.string().min(1),
      itemId: z.string().min(1),
      label: z.string().min(1),
      ap: z.number().int(),
      type: z.enum(["positive", "penalty"]),
    });

    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.flatten());

    const created = await addLog(parsed.data);
    return created;
  });

  app.get("/api/dashboard", async () => {
    const config = await getConfig();
    const allLogs = await getAllLogs();

    const startDate = allLogs.length
      ? allLogs.reduce(
          (min, current) => (current.date < min ? current.date : min),
          allLogs[0].date,
        )
      : dayjs().format("YYYY-MM-DD");

    const endDate = dayjs().format("YYYY-MM-DD");
    const daily = buildDailySummaries(allLogs, config, startDate, endDate);
    const totals = aggregateTotals(daily);

    const mainLevel = calculateLevel(totals.mainTotal, config);
    const categoryLevels = Object.fromEntries(
      config.categories.map((category) => {
        const total = totals.categoryTotals[category.id] ?? 0;
        return [
          category.id,
          { totalAp: total, ...calculateLevel(total, config) },
        ];
      }),
    );

    return {
      playerName: config.playerName,
      startDate,
      endDate,
      main: {
        totalAp: totals.mainTotal,
        ...mainLevel,
      },
      categories: config.categories.map((category) => ({
        ...category,
        ...(categoryLevels[category.id] ?? {
          totalAp: 0,
          level: 1,
          xpIntoLevel: 0,
          nextLevelXp: 0,
          progressRatio: 0,
        }),
      })),
      today: daily[daily.length - 1],
    };
  });

  app.get("/api/history", async (request, reply) => {
    const schema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });
    const parsed = schema.safeParse(request.query);
    if (!parsed.success) return reply.status(400).send(parsed.error.flatten());

    const config = await getConfig();
    const start = dayjs(`${parsed.data.month}-01`);
    const end = start.endOf("month");
    const logs = await getLogsInRange(
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD"),
    );
    const daily = buildDailySummaries(
      logs,
      config,
      start.format("YYYY-MM-DD"),
      end.format("YYYY-MM-DD"),
    );

    return {
      month: parsed.data.month,
      categories: config.categories,
      daily,
    };
  });

  app.get("/api/goals", async () => getGoals());

  app.post("/api/goals", async (request, reply) => {
    const schema = z.object({ text: z.string().min(1).max(300) });
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return reply.status(400).send(parsed.error.flatten());

    const goal = await addGoal(parsed.data.text);
    return goal;
  });

  app.delete("/api/goals/:id", async (request) => {
    const schema = z.object({ id: z.string().min(1) });
    const parsed = schema.parse(request.params);
    await deleteGoal(parsed.id);
    return { ok: true };
  });

  app.get("/api/level-estimation", async () => {
    const config = await getConfig();

    const ranges = [
      [1, 20],
      [21, 40],
      [41, 60],
      [61, 80],
      [81, 100],
    ];

    return ranges.map(([from, to]) => {
      const xpFrom = totalXpUntilLevel(from, config);
      const xpTo = totalXpUntilLevel(to + 1, config);
      const totalXp = xpTo - xpFrom;
      const estimatedDays = Math.ceil(
        totalXp / config.leveling.estimatedDailyAp,
      );

      return {
        from,
        to,
        totalXp,
        estimatedDays,
      };
    });
  });
};

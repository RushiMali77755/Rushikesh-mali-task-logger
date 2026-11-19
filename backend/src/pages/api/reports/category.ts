/**
 * Category-wise Report
 * GET /api/reports/category?from=DATE&to=DATE
 * Returns hours spent per category in the date range.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task } from '../../../db/schema';
import { and, gte, lte, eq, sql } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getCurrentDate, getMonthRange } from '../../../utils/time';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const now = new Date();
    const { start: defaultStart, end: defaultEnd } = getMonthRange(
      now.getFullYear(),
      now.getMonth() + 1
    );
    const from = url.searchParams.get('from') || defaultStart;
    const to = url.searchParams.get('to') || defaultEnd;

    // Get all logs in range
    const logs = await db
      .select()
      .from(dailyLog)
      .where(and(gte(dailyLog.logDate, from), lte(dailyLog.logDate, to)));

    if (logs.length === 0) {
      return success({ from, to, categories: [], totalHours: 0 });
    }

    const logIds = logs.map((l) => l.id);

    // Get all tasks for these logs
    const allTasks: any[] = [];
    for (const logId of logIds) {
      const tasks = await db.select().from(task).where(eq(task.dailyLogId, logId));
      allTasks.push(...tasks);
    }

    // Aggregate by category
    const categoryMap: Record<string, number> = {};
    let totalHours = 0;
    for (const t of allTasks) {
      const hours = t.durationHours || 0;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + hours;
      totalHours += hours;
    }

    const categories = Object.entries(categoryMap)
      .map(([category, hours]) => ({
        category,
        hours: Math.round(hours * 100) / 100,
        percentage: totalHours > 0 ? Math.round((hours / totalHours) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    return success({
      from,
      to,
      categories,
      totalHours: Math.round(totalHours * 100) / 100,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to generate category report', 500);
  }
};

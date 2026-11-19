/**
 * Weekly Report
 * GET /api/reports/weekly?date=YYYY-MM-DD
 * Returns all logs for the week containing that date, with daily summaries and totals.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task } from '../../../db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getCurrentDate, getWeekRange } from '../../../utils/time';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || getCurrentDate();
    const { start, end } = getWeekRange(date);

    const logs = await db
      .select()
      .from(dailyLog)
      .where(and(gte(dailyLog.logDate, start), lte(dailyLog.logDate, end)));

    // Build daily summaries
    const dailySummaries = await Promise.all(
      logs.map(async (log) => {
        const tasks = await db.select().from(task).where(eq(task.dailyLogId, log.id));
        const totalTaskHours = tasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);
        return {
          date: log.logDate,
          loginTime: log.loginTime,
          logoutTime: log.logoutTime,
          totalWorkingHours: log.totalWorkingHours,
          totalTaskHours: Math.round(totalTaskHours * 100) / 100,
          taskCount: tasks.length,
          completedCount: tasks.filter((t) => t.status === 'Completed').length,
        };
      })
    );

    const totalWorkingHours = logs.reduce((sum, l) => sum + (l.totalWorkingHours || 0), 0);
    const workingDays = logs.length;

    return success({
      weekStart: start,
      weekEnd: end,
      workingDays,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      avgDailyHours: workingDays > 0 ? Math.round((totalWorkingHours / workingDays) * 100) / 100 : 0,
      dailySummaries,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to generate weekly report', 500);
  }
};

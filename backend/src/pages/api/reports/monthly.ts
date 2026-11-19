/**
 * Monthly Report
 * GET /api/reports/monthly?year=YYYY&month=MM
 * Returns all logs for the month with daily summaries, monthly totals, working days count.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task } from '../../../db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getMonthRange } from '../../../utils/time';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const now = new Date();
    const year = parseInt(url.searchParams.get('year') || String(now.getFullYear()), 10);
    const month = parseInt(url.searchParams.get('month') || String(now.getMonth() + 1), 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return error('Invalid year or month');
    }

    const { start, end } = getMonthRange(year, month);

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
      year,
      month,
      monthStart: start,
      monthEnd: end,
      workingDays,
      totalWorkingHours: Math.round(totalWorkingHours * 100) / 100,
      avgDailyHours: workingDays > 0 ? Math.round((totalWorkingHours / workingDays) * 100) / 100 : 0,
      dailySummaries,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to generate monthly report', 500);
  }
};

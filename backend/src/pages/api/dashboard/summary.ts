/**
 * Dashboard Summary
 * GET /api/dashboard/summary
 * Returns: total hours this week, total hours this month, tasks completed today,
 * tasks pending, avg daily hours.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task } from '../../../db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getCurrentDate, getWeekRange, getMonthRange } from '../../../utils/time';

export const GET = async () => {
  try {
    const today = getCurrentDate();
    const now = new Date();
    const { start: weekStart, end: weekEnd } = getWeekRange(today);
    const { start: monthStart, end: monthEnd } = getMonthRange(
      now.getFullYear(),
      now.getMonth() + 1
    );

    // This week's logs
    const weekLogs = await db
      .select()
      .from(dailyLog)
      .where(and(gte(dailyLog.logDate, weekStart), lte(dailyLog.logDate, weekEnd)));

    const totalHoursThisWeek = weekLogs.reduce((sum, l) => sum + (l.totalWorkingHours || 0), 0);

    // This month's logs
    const monthLogs = await db
      .select()
      .from(dailyLog)
      .where(and(gte(dailyLog.logDate, monthStart), lte(dailyLog.logDate, monthEnd)));

    const totalHoursThisMonth = monthLogs.reduce((sum, l) => sum + (l.totalWorkingHours || 0), 0);

    // Today's log and tasks
    const todayLog = await db
      .select()
      .from(dailyLog)
      .where(eq(dailyLog.logDate, today))
      .limit(1);

    let tasksCompletedToday = 0;
    let tasksPending = 0;

    if (todayLog.length > 0) {
      const todayTasks = await db.select().from(task).where(eq(task.dailyLogId, todayLog[0].id));
      tasksCompletedToday = todayTasks.filter((t) => t.status === 'Completed').length;
      tasksPending = todayTasks.filter((t) => t.status !== 'Completed').length;
    }

    // Average daily hours (this month)
    const workingDays = monthLogs.length;
    const avgDailyHours = workingDays > 0 ? totalHoursThisMonth / workingDays : 0;

    return success({
      totalHoursThisWeek: Math.round(totalHoursThisWeek * 100) / 100,
      totalHoursThisMonth: Math.round(totalHoursThisMonth * 100) / 100,
      tasksCompletedToday,
      tasksPending,
      avgDailyHours: Math.round(avgDailyHours * 100) / 100,
      workingDaysThisMonth: workingDays,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to fetch dashboard summary', 500);
  }
};

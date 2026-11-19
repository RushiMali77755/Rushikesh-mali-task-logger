/**
 * Daily Report
 * GET /api/reports/daily?date=YYYY-MM-DD
 * Returns that day's full log with all tasks, total hours, category breakdown.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task, taskTag } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getCurrentDate } from '../../../utils/time';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || getCurrentDate();

    const log = await db
      .select()
      .from(dailyLog)
      .where(eq(dailyLog.logDate, date))
      .limit(1);

    if (log.length === 0) return error(`No log found for date ${date}`, 404);

    const tasks = await db.select().from(task).where(eq(task.dailyLogId, log[0].id));
    const tasksWithTags = await Promise.all(
      tasks.map(async (t) => {
        const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, t.id));
        return { ...t, tags: tags.map((tg) => tg.tagName) };
      })
    );

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; hours: number }> = {};
    for (const t of tasks) {
      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = { count: 0, hours: 0 };
      }
      categoryBreakdown[t.category].count++;
      categoryBreakdown[t.category].hours += t.durationHours || 0;
    }

    // Total task hours
    const totalTaskHours = tasks.reduce((sum, t) => sum + (t.durationHours || 0), 0);

    return success({
      log: log[0],
      tasks: tasksWithTags,
      totalTaskHours: Math.round(totalTaskHours * 100) / 100,
      categoryBreakdown,
      taskCount: tasks.length,
      completedCount: tasks.filter((t) => t.status === 'Completed').length,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to generate daily report', 500);
  }
};

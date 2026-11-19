/**
 * Daily Log by Date
 * GET /api/daily-logs/by-date/:date
 */
import type { APIContext } from 'astro';
import { db } from '../../../../db';
import { dailyLog, task, taskTag } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../../utils/response';

export const GET = async ({ params }: APIContext) => {
  try {
    const date = params.date;
    if (!date) return error('Date parameter is required', 400);

    const log = await db
      .select()
      .from(dailyLog)
      .where(eq(dailyLog.logDate, date))
      .limit(1);

    if (log.length === 0) return error(`No log found for date ${date}`, 404);

    // Fetch tasks with their tags
    const tasks = await db.select().from(task).where(eq(task.dailyLogId, log[0].id));
    const tasksWithTags = await Promise.all(
      tasks.map(async (t) => {
        const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, t.id));
        return { ...t, tags: tags.map((tg) => tg.tagName) };
      })
    );

    return success({ ...log[0], tasks: tasksWithTags });
  } catch (err: any) {
    return error(err.message || 'Failed to fetch log by date', 500);
  }
};

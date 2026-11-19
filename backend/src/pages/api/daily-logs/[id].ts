/**
 * Daily Log by ID — Get, Update, Delete
 * GET    /api/daily-logs/:id
 * PUT    /api/daily-logs/:id
 * DELETE /api/daily-logs/:id
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task, taskTag } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { calculateHours, getCurrentTimestamp } from '../../../utils/time';

export const GET = async ({ params }: APIContext) => {
  try {
    const id = parseInt(params.id!, 10);
    if (isNaN(id)) return error('Invalid id', 400);

    const log = await db.select().from(dailyLog).where(eq(dailyLog.id, id)).limit(1);
    if (log.length === 0) return error('Daily log not found', 404);

    // Fetch tasks with their tags
    const tasks = await db.select().from(task).where(eq(task.dailyLogId, id));
    const tasksWithTags = await Promise.all(
      tasks.map(async (t) => {
        const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, t.id));
        return { ...t, tags: tags.map((tg) => tg.tagName) };
      })
    );

    return success({ ...log[0], tasks: tasksWithTags });
  } catch (err: any) {
    return error(err.message || 'Failed to fetch daily log', 500);
  }
};

export const PUT = async ({ params, request }: APIContext) => {
  try {
    const id = parseInt(params.id!, 10);
    if (isNaN(id)) return error('Invalid id', 400);

    const existing = await db.select().from(dailyLog).where(eq(dailyLog.id, id)).limit(1);
    if (existing.length === 0) return error('Daily log not found', 404);

    const body = await request.json();
    const updates: any = { updatedAt: getCurrentTimestamp() };

    if (body.loginTime !== undefined) updates.loginTime = body.loginTime;
    if (body.logoutTime !== undefined) updates.logoutTime = body.logoutTime;
    if (body.dayComment !== undefined) updates.dayComment = body.dayComment;
    if (body.logoutReminderSent !== undefined) updates.logoutReminderSent = body.logoutReminderSent;
    if (body.logDate !== undefined) updates.logDate = body.logDate;

    // Auto-calculate total working hours
    const loginTime = updates.loginTime || existing[0].loginTime;
    const logoutTime = updates.logoutTime !== undefined ? updates.logoutTime : existing[0].logoutTime;
    if (loginTime && logoutTime) {
      updates.totalWorkingHours = calculateHours(loginTime, logoutTime);
    }

    const result = await db
      .update(dailyLog)
      .set(updates)
      .where(eq(dailyLog.id, id))
      .returning();

    return success(result[0]);
  } catch (err: any) {
    return error(err.message || 'Failed to update daily log', 500);
  }
};

export const DELETE = async ({ params }: APIContext) => {
  try {
    const id = parseInt(params.id!, 10);
    if (isNaN(id)) return error('Invalid id', 400);

    const existing = await db.select().from(dailyLog).where(eq(dailyLog.id, id)).limit(1);
    if (existing.length === 0) return error('Daily log not found', 404);

    // Cascade delete handled by FK constraints, but let's be explicit
    const tasks_list = await db.select().from(task).where(eq(task.dailyLogId, id));
    for (const t of tasks_list) {
      await db.delete(taskTag).where(eq(taskTag.taskId, t.id));
    }
    await db.delete(task).where(eq(task.dailyLogId, id));
    await db.delete(dailyLog).where(eq(dailyLog.id, id));

    return success({ message: 'Daily log deleted successfully' });
  } catch (err: any) {
    return error(err.message || 'Failed to delete daily log', 500);
  }
};

/**
 * Tasks for a Daily Log — List and Create
 * GET  /api/daily-logs/:logId/tasks
 * POST /api/daily-logs/:logId/tasks
 */
import type { APIContext } from 'astro';
import { db } from '../../../../../db';
import { dailyLog, task, taskTag, TASK_CATEGORIES, TASK_STATUSES } from '../../../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../../../utils/response';
import { calculateHours, getCurrentTimestamp } from '../../../../../utils/time';

export const GET = async ({ params }: APIContext) => {
  try {
    const logId = parseInt(params.logId!, 10);
    if (isNaN(logId)) return error('Invalid logId', 400);

    // Verify log exists
    const log = await db.select().from(dailyLog).where(eq(dailyLog.id, logId)).limit(1);
    if (log.length === 0) return error('Daily log not found', 404);

    const tasks = await db.select().from(task).where(eq(task.dailyLogId, logId));
    const tasksWithTags = await Promise.all(
      tasks.map(async (t) => {
        const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, t.id));
        return { ...t, tags: tags.map((tg) => tg.tagName) };
      })
    );

    return success(tasksWithTags);
  } catch (err: any) {
    return error(err.message || 'Failed to fetch tasks', 500);
  }
};

export const POST = async ({ params, request }: APIContext) => {
  try {
    const logId = parseInt(params.logId!, 10);
    if (isNaN(logId)) return error('Invalid logId', 400);

    // Verify log exists
    const log = await db.select().from(dailyLog).where(eq(dailyLog.id, logId)).limit(1);
    if (log.length === 0) return error('Daily log not found', 404);

    const body = await request.json();
    const { description, category, status, startTime, endTime, sortOrder, tags } = body;

    // Validation
    if (!description || !description.trim()) return error('Task description is required');
    if (!category) return error('Task category is required');
    if (!TASK_CATEGORIES.includes(category)) {
      return error(`Invalid category. Allowed: ${TASK_CATEGORIES.join(', ')}`);
    }
    if (status && !TASK_STATUSES.includes(status)) {
      return error(`Invalid status. Allowed: ${TASK_STATUSES.join(', ')}`);
    }
    if (startTime && endTime) {
      const hours = calculateHours(startTime, endTime);
      if (hours <= 0) return error('end_time must be after start_time');
    }

    // Auto-calculate duration
    let durationHours: number | null = null;
    if (startTime && endTime) {
      durationHours = calculateHours(startTime, endTime);
    }

    const now = getCurrentTimestamp();

    const result = await db.insert(task).values({
      dailyLogId: logId,
      description: description.trim(),
      category,
      status: status || 'In Progress',
      startTime: startTime || null,
      endTime: endTime || null,
      durationHours,
      sortOrder: sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    }).returning();

    const newTask = result[0];

    // Insert tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        await db.insert(taskTag).values({
          taskId: newTask.id,
          tagName: tagName.trim(),
        });
      }
    }

    // Return task with tags
    const insertedTags = await db.select().from(taskTag).where(eq(taskTag.taskId, newTask.id));

    return success({ ...newTask, tags: insertedTags.map((t) => t.tagName) }, 201);
  } catch (err: any) {
    return error(err.message || 'Failed to create task', 500);
  }
};

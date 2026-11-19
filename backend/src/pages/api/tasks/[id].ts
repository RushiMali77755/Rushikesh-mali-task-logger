/**
 * Task by ID — Update and Delete
 * PUT    /api/tasks/:id
 * DELETE /api/tasks/:id
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { task, taskTag, TASK_CATEGORIES, TASK_STATUSES } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { calculateHours, getCurrentTimestamp } from '../../../utils/time';

export const PUT = async ({ params, request }: APIContext) => {
  try {
    const id = parseInt(params.id!, 10);
    if (isNaN(id)) return error('Invalid id', 400);

    const existing = await db.select().from(task).where(eq(task.id, id)).limit(1);
    if (existing.length === 0) return error('Task not found', 404);

    const body = await request.json();
    const updates: any = { updatedAt: getCurrentTimestamp() };

    if (body.description !== undefined) {
      if (!body.description.trim()) return error('Task description cannot be empty');
      updates.description = body.description.trim();
    }
    if (body.category !== undefined) {
      if (!TASK_CATEGORIES.includes(body.category)) {
        return error(`Invalid category. Allowed: ${TASK_CATEGORIES.join(', ')}`);
      }
      updates.category = body.category;
    }
    if (body.status !== undefined) {
      if (!TASK_STATUSES.includes(body.status)) {
        return error(`Invalid status. Allowed: ${TASK_STATUSES.join(', ')}`);
      }
      updates.status = body.status;
    }
    if (body.startTime !== undefined) updates.startTime = body.startTime;
    if (body.endTime !== undefined) updates.endTime = body.endTime;
    if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

    // Auto-calculate duration
    const startTime = updates.startTime ?? existing[0].startTime;
    const endTime = updates.endTime !== undefined ? updates.endTime : existing[0].endTime;
    if (startTime && endTime) {
      const hours = calculateHours(startTime, endTime);
      if (hours <= 0) return error('end_time must be after start_time');
      updates.durationHours = hours;
    }

    const result = await db.update(task).set(updates).where(eq(task.id, id)).returning();

    // Handle tags update if provided
    if (body.tags !== undefined && Array.isArray(body.tags)) {
      // Remove existing tags
      await db.delete(taskTag).where(eq(taskTag.taskId, id));
      // Insert new tags
      for (const tagName of body.tags) {
        await db.insert(taskTag).values({
          taskId: id,
          tagName: tagName.trim(),
        });
      }
    }

    // Return task with tags
    const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, id));

    return success({ ...result[0], tags: tags.map((t) => t.tagName) });
  } catch (err: any) {
    return error(err.message || 'Failed to update task', 500);
  }
};

export const DELETE = async ({ params }: APIContext) => {
  try {
    const id = parseInt(params.id!, 10);
    if (isNaN(id)) return error('Invalid id', 400);

    const existing = await db.select().from(task).where(eq(task.id, id)).limit(1);
    if (existing.length === 0) return error('Task not found', 404);

    // Delete tags first (cascade should handle it, but be explicit)
    await db.delete(taskTag).where(eq(taskTag.taskId, id));
    await db.delete(task).where(eq(task.id, id));

    return success({ message: 'Task deleted successfully' });
  } catch (err: any) {
    return error(err.message || 'Failed to delete task', 500);
  }
};

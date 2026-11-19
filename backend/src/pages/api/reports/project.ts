/**
 * Project/Tag-wise Report
 * GET /api/reports/project?from=DATE&to=DATE
 * Returns hours spent per tag in the date range.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task, taskTag } from '../../../db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';
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
      return success({ from, to, tags: [], totalHours: 0 });
    }

    const logIds = logs.map((l) => l.id);

    // Get all tasks for these logs, then their tags
    const tagMap: Record<string, number> = {};
    let totalHours = 0;

    for (const logId of logIds) {
      const tasks = await db.select().from(task).where(eq(task.dailyLogId, logId));
      for (const t of tasks) {
        const tags = await db.select().from(taskTag).where(eq(taskTag.taskId, t.id));
        const hours = t.durationHours || 0;
        for (const tag of tags) {
          tagMap[tag.tagName] = (tagMap[tag.tagName] || 0) + hours;
          totalHours += hours;
        }
      }
    }

    const tagList = Object.entries(tagMap)
      .map(([tagName, hours]) => ({
        tag: tagName,
        hours: Math.round(hours * 100) / 100,
        percentage: totalHours > 0 ? Math.round((hours / totalHours) * 10000) / 100 : 0,
      }))
      .sort((a, b) => b.hours - a.hours);

    return success({
      from,
      to,
      tags: tagList,
      totalHours: Math.round(totalHours * 100) / 100,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to generate project report', 500);
  }
};

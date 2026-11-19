/**
 * Daily Logs API — List and Create
 * GET  /api/daily-logs?from=&to=&page=&limit=
 * POST /api/daily-logs
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog, task, taskTag } from '../../../db/schema';
import { eq, and, gte, lte, desc, sql, asc } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { calculateHours, getCurrentDate, getCurrentTimestamp } from '../../../utils/time';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (from) conditions.push(gte(dailyLog.logDate, from));
    if (to) conditions.push(lte(dailyLog.logDate, to));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select()
      .from(dailyLog)
      .where(where)
      .orderBy(desc(dailyLog.logDate))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(dailyLog)
      .where(where);

    const total = countResult[0]?.count || 0;

    return success({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return error(err.message || 'Failed to fetch daily logs', 500);
  }
};

export const POST = async ({ request }: APIContext) => {
  try {
    const body = await request.json();
    const { logDate, loginTime, logoutTime, dayComment } = body;

    if (!logDate) return error('logDate is required');
    if (!loginTime) return error('loginTime is required');

    // Check unique date
    const existing = await db
      .select()
      .from(dailyLog)
      .where(eq(dailyLog.logDate, logDate))
      .limit(1);

    if (existing.length > 0) {
      return error(`A log for date ${logDate} already exists`, 409);
    }

    // Auto-calculate working hours if logout is provided
    let totalWorkingHours: number | null = null;
    if (logoutTime) {
      totalWorkingHours = calculateHours(loginTime, logoutTime);
    }

    const now = getCurrentTimestamp();

    const result = await db.insert(dailyLog).values({
      logDate,
      loginTime,
      logoutTime: logoutTime || null,
      totalWorkingHours,
      dayComment: dayComment || null,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return success(result[0], 201);
  } catch (err: any) {
    return error(err.message || 'Failed to create daily log', 500);
  }
};

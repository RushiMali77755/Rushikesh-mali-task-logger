/**
 * Dashboard Trends
 * GET /api/dashboard/trends?days=30
 * Returns array of {date, hours} for the working hours trend chart.
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog } from '../../../db/schema';
import { and, gte, lte, desc } from 'drizzle-orm';
import { success, error } from '../../../utils/response';

export const GET = async ({ request }: APIContext) => {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const logs = await db
      .select({
        date: dailyLog.logDate,
        hours: dailyLog.totalWorkingHours,
      })
      .from(dailyLog)
      .where(and(gte(dailyLog.logDate, start), lte(dailyLog.logDate, end)))
      .orderBy(dailyLog.logDate);

    const trend = logs.map((l) => ({
      date: l.date,
      hours: l.hours || 0,
    }));

    return success({ days, from: start, to: end, trend });
  } catch (err: any) {
    return error(err.message || 'Failed to fetch trends', 500);
  }
};

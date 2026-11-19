/**
 * Reminders Check
 * GET /api/reminders/check
 * Returns {loginMissing: boolean, logoutMissing: boolean, date: string}
 */
import type { APIContext } from 'astro';
import { db } from '../../../db';
import { dailyLog } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { success, error } from '../../../utils/response';
import { getCurrentDate } from '../../../utils/time';

export const GET = async () => {
  try {
    const today = getCurrentDate();

    const log = await db
      .select()
      .from(dailyLog)
      .where(eq(dailyLog.logDate, today))
      .limit(1);

    if (log.length === 0) {
      // No log for today — login is missing
      return success({
        loginMissing: true,
        logoutMissing: false,
        date: today,
      });
    }

    const todayLog = log[0];
    return success({
      loginMissing: false,
      logoutMissing: !todayLog.logoutTime,
      date: today,
    });
  } catch (err: any) {
    return error(err.message || 'Failed to check reminders', 500);
  }
};

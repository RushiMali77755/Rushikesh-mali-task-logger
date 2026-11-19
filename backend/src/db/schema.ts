/**
 * Drizzle ORM schema for the Corporate Developer Task Logger.
 * Uses better-sqlite3 as the database driver.
 */
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/** Allowed task categories */
export const TASK_CATEGORIES = [
  'Logs Checking',
  'Bug Fixing',
  'API Development',
  'Database Work',
  'Code Review',
  'Deployment',
  'Testing',
  'Documentation',
  'Meetings',
  'Support',
  'Production Issue',
] as const;

/** Allowed task statuses */
export const TASK_STATUSES = ['In Progress', 'Pending', 'Completed'] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * daily_log table — one record per working day.
 */
export const dailyLog = sqliteTable('daily_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  logDate: text('log_date').notNull().unique(),
  loginTime: text('login_time').notNull(),
  logoutTime: text('logout_time'),
  totalWorkingHours: real('total_working_hours'),
  dayComment: text('day_comment'),
  logoutReminderSent: integer('logout_reminder_sent').default(0).notNull(),
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

/**
 * task table — individual tasks belonging to a daily log.
 */
export const task = sqliteTable('task', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  dailyLogId: integer('daily_log_id')
    .notNull()
    .references(() => dailyLog.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull().default('In Progress'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  durationHours: real('duration_hours'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: text('created_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
  updatedAt: text('updated_at')
    .default(sql`(datetime('now'))`)
    .notNull(),
});

/**
 * task_tag table — tags associated with a task (many-to-many via tag name).
 */
export const taskTag = sqliteTable('task_tag', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('task_id')
    .notNull()
    .references(() => task.id, { onDelete: 'cascade' }),
  tagName: text('tag_name').notNull(),
});

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

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_STATUSES = ['In Progress', 'Pending', 'Completed'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PREDEFINED_TAGS = [
  'Production',
  'UAT',
  'Development',
  'Testing',
  'Checking',
  'Log',
] as const;

export interface Task {
  id: number;
  dailyLogId: number;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  startTime: string | null;
  endTime: string | null;
  durationHours: number | null;
  sortOrder: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  description: string;
  category: TaskCategory;
  status?: TaskStatus;
  startTime?: string | null;
  endTime?: string | null;
  sortOrder?: number;
  tags?: string[];
}

export interface UpdateTaskDto {
  description?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  startTime?: string | null;
  endTime?: string | null;
  sortOrder?: number;
  tags?: string[];
}

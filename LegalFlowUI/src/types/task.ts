export const TaskStatus = {
  Todo: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
} as const;

export type TaskStatus =
  (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
} as const;

export type TaskPriority =
  (typeof TaskPriority)[keyof typeof TaskPriority];

export type Task = {
  id: string;
  caseId: string;
  assignedToId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  completedAt?: string | null;
};

export type CreateTaskRequest = {
  assignedToId: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
};

export type UpdateTaskRequest = {
  assignedToId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
};

export type FirmUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
};
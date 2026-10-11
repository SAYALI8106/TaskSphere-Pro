export type Priority = "low" | "medium" | "high";
export type Status = "TODO" | "IN_PROGRESS" | "COMPLETED";

export type Task = {
  id: number;
  title: string;
  name: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string | null;
  category?: string;
  done: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId: number;
};

export type User = {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RegistrationData = {
  email: string;
  password: string;
  name: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type TaskStats = {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  highPriority: number;
  overdue: number;
  done?: number;
  active?: number;
};

export type FilterValue = "all" | "TODO" | "IN_PROGRESS" | "COMPLETED";
export type PriorityFilter = "all" | "low" | "medium" | "high";
export type DueFilter = "all" | "overdue" | "dueToday" | "upcoming";

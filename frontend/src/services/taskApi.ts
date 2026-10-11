import { Priority, Status, Task, TaskStats } from "../types";
import api from "./api";

export type NewTaskData = {
  title?: string;
  name?: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: string | null;
  category?: string;
  done?: boolean;
};

export type UpdateTaskData = Partial<NewTaskData>;

export type PaginatedTasks = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Task[];
};

export type GetTasksParams = {
  q?: string; // search
  status?: string;
  priority?: string;
  category?: string;
  dueFilter?: string;
  done?: boolean;
  sortBy?: "priority" | "createdAt" | "updatedAt" | "name" | "title" | "dueDate" | "status";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export const taskApi = {
  getAllTasks: async (params?: GetTasksParams) => {
    const response = await api.get<PaginatedTasks>("/tasks", { params });
    return response.data;
  },

  getTask: async (id: number) => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: NewTaskData) => {
    const payload = {
      title: taskData.title || taskData.name,
      name: taskData.name || taskData.title,
      description: taskData.description,
      status: taskData.status || "TODO",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate,
      category: taskData.category || "General",
      done: taskData.done
    };
    const response = await api.post<Task>("/tasks", payload);
    return response.data;
  },

  updateTask: async (id: number, updatedTask: UpdateTaskData) => {
    const response = await api.put<Task>(`/tasks/${id}`, updatedTask);
    return response.data;
  },

  deleteTask: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },

  toggleTask: async (id: number) => {
    const response = await api.patch<Task>(`/tasks/${id}/toggle`);
    return response.data;
  },

  getTaskStats: async () => {
    const response = await api.get<TaskStats>("/tasks/stats");
    return response.data;
  }
};

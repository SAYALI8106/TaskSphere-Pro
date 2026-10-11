import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as TaskModel from "../models/taskModel";
import { AuthRequest, CreateTaskPayloadSchema, Priority, UpdateTaskPayloadSchema } from "../types";

// GET /api/tasks - Get all tasks (search + filters + sort + pagination)
export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    let tasks = await TaskModel.getAllTasksByUserId(req.userId!);

    /* SEARCH */
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    if (q) {
      tasks = tasks.filter(
        (t) =>
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    /* FILTER BY STATUS */
    const statusQuery = typeof req.query.status === "string" ? req.query.status.toUpperCase() : undefined;
    if (statusQuery) {
      if (statusQuery === "DONE" || statusQuery === "COMPLETED") {
        tasks = tasks.filter((t) => t.status === "COMPLETED" || t.done);
      } else if (statusQuery === "ACTIVE") {
        tasks = tasks.filter((t) => !t.done && t.status !== "COMPLETED");
      } else {
        tasks = tasks.filter((t) => t.status === statusQuery);
      }
    }

    /* FILTER BY LEGACY DONE STATUS */
    if (req.query.done !== undefined && !statusQuery) {
      const done = req.query.done === "true";
      tasks = tasks.filter((t) => t.done === done);
    }

    /* FILTER BY PRIORITY */
    const priorityQuery = typeof req.query.priority === "string" ? req.query.priority.toLowerCase() : undefined;
    if (priorityQuery && priorityQuery !== "all") {
      tasks = tasks.filter((t) => (t.priority || "").toString().toLowerCase() === priorityQuery);
    }

    /* FILTER BY CATEGORY */
    const categoryQuery = typeof req.query.category === "string" ? req.query.category.trim() : undefined;
    if (categoryQuery && categoryQuery !== "all") {
      tasks = tasks.filter((t) => (t.category || "").toLowerCase() === categoryQuery.toLowerCase());
    }

    /* FILTER BY DUE DATE (overdue | dueToday | upcoming) */
    const dueFilter = typeof req.query.dueFilter === "string" ? req.query.dueFilter : undefined;
    if (dueFilter) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      if (dueFilter === "overdue") {
        tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < todayStart && !t.done && t.status !== "COMPLETED");
      } else if (dueFilter === "dueToday") {
        tasks = tasks.filter((t) => {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          return d >= todayStart && d <= todayEnd;
        });
      } else if (dueFilter === "upcoming") {
        tasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) > todayEnd);
      }
    }

    /* SORTING */
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const priorityOrder: Record<string, number> = {
      high: 3,
      medium: 2,
      low: 1
    };

    tasks = [...tasks].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "priority") {
        const aVal = priorityOrder[(a.priority || "medium").toString().toLowerCase()] || 2;
        const bVal = priorityOrder[(b.priority || "medium").toString().toLowerCase()] || 2;
        comparison = aVal - bVal;
      } else if (sortBy === "dueDate") {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        comparison = aTime - bTime;
      } else if (sortBy === "title" || sortBy === "name") {
        const aTitle = a.title || a.name || "";
        const bTitle = b.title || b.name || "";
        comparison = aTitle.localeCompare(bTitle);
      } else {
        // default createdAt
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        comparison = aTime - bTime;
      }

      return order === "desc" ? -comparison : comparison;
    });

    /* PAGINATION */
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTasks = tasks.slice(startIndex, endIndex);

    res.status(StatusCodes.OK).json({
      page,
      limit,
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / limit) || 1,
      data: paginatedTasks
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/:id - Get a single task
export const getTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;
    const { id } = req.params;
    const task = await TaskModel.getTaskById(Number(id), req.userId!);
    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Task not found" });
    }

    res.status(StatusCodes.OK).json(task);
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks - Create a task
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    const parsedData = CreateTaskPayloadSchema.parse(req.body);
    const newTask = await TaskModel.createTask(parsedData, req.userId!);
    res.status(StatusCodes.CREATED).json(newTask);
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id - Update a task
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    const { id } = req.params;
    const parsedData = UpdateTaskPayloadSchema.parse(req.body);
    const updatedTask = await TaskModel.updateTask(
      Number(id),
      req.userId!,
      parsedData
    );
    if (!updatedTask) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Task not found" });
    }

    res.status(StatusCodes.OK).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id - Delete a task
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    const { id } = req.params;
    const deleted = await TaskModel.deleteTask(Number(id), req.userId!);

    if (!deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Task not found" });
    }

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

// PATCH /api/tasks/:id/toggle or status
export const toggleTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    const taskId = Number(req.params.id);
    const task = await TaskModel.getTaskById(taskId, req.userId!);

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Task not found" });
    }

    const updated = await TaskModel.toggleTaskDone(taskId, req.userId!);

    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

// GET /api/tasks/stats
export const getTaskStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!ensureIsAuthenticated(req, res)) return;

    const tasks = await TaskModel.getAllTasksByUserId(req.userId!);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED" || t.done).length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todo = tasks.filter((t) => t.status === "TODO" && !t.done).length;
    const active = total - completed;

    const highPriority = tasks.filter(
      (t) => (t.priority || "").toString().toLowerCase() === "high"
    ).length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < todayStart && !t.done && t.status !== "COMPLETED"
    ).length;

    res.status(StatusCodes.OK).json({
      total,
      completed,
      done: completed, // legacy alias
      inProgress,
      todo,
      active, // legacy alias
      highPriority,
      overdue
    });
  } catch (error) {
    next(error);
  }
};

const ensureIsAuthenticated = (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authenticated" });
    return false;
  }

  return true;
};

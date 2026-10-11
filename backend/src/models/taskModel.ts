import prisma from "../config/prisma";
import { localStore } from "../config/localStore";
import { isUsingPostgres } from "../config/dbConnection";
import { CreateTaskPayload, Priority, Status, Task, UpdateTaskPayload } from "../types";

const normalizePriority = (priority?: string): Priority => {
  if (!priority) return "MEDIUM";
  const p = priority.toUpperCase();
  if (p === "HIGH" || p === "LOW" || p === "MEDIUM") return p as Priority;
  return "MEDIUM";
};

const normalizeStatus = (status?: string, done?: boolean): Status => {
  if (status) {
    const s = status.toUpperCase();
    if (s === "TODO" || s === "IN_PROGRESS" || s === "COMPLETED") return s as Status;
  }
  if (done === true) return "COMPLETED";
  if (done === false) return "TODO";
  return "TODO";
};

export const getAllTasksByUserId = async (userId: number): Promise<Task[]> => {
  if (!isUsingPostgres()) {
    return localStore.getAllTasksByUserId(userId);
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return tasks.map(formatTaskResponse);
};

export const getAllTasks = getAllTasksByUserId;

export const getTaskById = async (
  id: number,
  userId: number
): Promise<Task | null> => {
  if (!isUsingPostgres()) {
    return localStore.getTaskById(id, userId);
  }

  const task = await prisma.task.findFirst({ where: { id, userId } });
  return task ? formatTaskResponse(task) : null;
};

export const createTask = async (
  taskData: CreateTaskPayload,
  userId: number
): Promise<Task> => {
  if (!isUsingPostgres()) {
    return localStore.createTask(taskData, userId);
  }

  const taskTitle = taskData.title || taskData.name || "Untitled Task";
  const status = normalizeStatus(taskData.status, taskData.done);
  const priority = normalizePriority(taskData.priority);
  const isDone = taskData.done ?? (status === "COMPLETED");

  const created = await prisma.task.create({
    data: {
      title: taskTitle,
      name: taskTitle,
      description: taskData.description || null,
      status,
      priority,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      category: taskData.category || "General",
      done: isDone,
      userId
    }
  });

  return formatTaskResponse(created);
};

export const updateTask = async (
  id: number,
  userId: number,
  updatedTask: UpdateTaskPayload
): Promise<Task | null> => {
  if (!isUsingPostgres()) {
    return localStore.updateTask(id, userId, updatedTask);
  }

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return null;

    const dataToUpdate: any = {};

    if (updatedTask.title !== undefined || updatedTask.name !== undefined) {
      const title = updatedTask.title || updatedTask.name || existing.title || existing.name;
      dataToUpdate.title = title;
      dataToUpdate.name = title;
    }

    if (updatedTask.description !== undefined) {
      dataToUpdate.description = updatedTask.description;
    }

    if (updatedTask.category !== undefined) {
      dataToUpdate.category = updatedTask.category;
    }

    if (updatedTask.dueDate !== undefined) {
      dataToUpdate.dueDate = updatedTask.dueDate ? new Date(updatedTask.dueDate) : null;
    }

    if (updatedTask.priority !== undefined) {
      dataToUpdate.priority = normalizePriority(updatedTask.priority);
    }

    if (updatedTask.status !== undefined || updatedTask.done !== undefined) {
      const status = normalizeStatus(
        updatedTask.status,
        updatedTask.done !== undefined ? updatedTask.done : (existing.done ?? false)
      );
      dataToUpdate.status = status;
      dataToUpdate.done = updatedTask.done !== undefined ? updatedTask.done : (status === "COMPLETED");
    }

    const updated = await prisma.task.update({
      where: { id },
      data: dataToUpdate
    });

    return formatTaskResponse(updated);
  } catch {
    return null;
  }
};

export const toggleTaskDone = async (id: number, userId: number): Promise<Task | null> => {
  if (!isUsingPostgres()) {
    return localStore.toggleTaskDone(id, userId);
  }

  const task = await getTaskById(id, userId);
  if (!task) return null;
  const newDone = !task.done;
  return await updateTask(id, userId, {
    done: newDone,
    status: newDone ? "COMPLETED" : "TODO"
  });
};

export const deleteTask = async (id: number, userId: number): Promise<boolean> => {
  if (!isUsingPostgres()) {
    return localStore.deleteTask(id, userId);
  }

  try {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.task.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
};

const formatTaskResponse = (rawTask: any): Task => {
  const title = rawTask.title || rawTask.name || "Untitled Task";
  const name = title;
  const priorityStr = (rawTask.priority || "MEDIUM").toString().toLowerCase();
  const priority = (priorityStr === "high" || priorityStr === "medium" || priorityStr === "low")
    ? priorityStr
    : "medium";

  const statusStr = (rawTask.status || (rawTask.done ? "COMPLETED" : "TODO")).toString().toUpperCase();
  const status = (statusStr === "IN_PROGRESS" || statusStr === "COMPLETED" || statusStr === "TODO")
    ? (statusStr as Status)
    : (rawTask.done ? "COMPLETED" : "TODO");

  return {
    id: rawTask.id,
    title: title,
    name: name,
    description: rawTask.description || "",
    status: status,
    priority: priority as any,
    dueDate: rawTask.dueDate ? (rawTask.dueDate instanceof Date ? rawTask.dueDate.toISOString() : new Date(rawTask.dueDate).toISOString()) : null,
    category: rawTask.category || "General",
    done: rawTask.done ?? (status === "COMPLETED"),
    createdAt: rawTask.createdAt instanceof Date ? rawTask.createdAt.toISOString() : rawTask.createdAt,
    updatedAt: rawTask.updatedAt instanceof Date ? rawTask.updatedAt.toISOString() : rawTask.updatedAt,
    userId: rawTask.userId
  };
};

import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { CreateTaskPayload, Priority, Status, Task, UpdateTaskPayload, User, RegistrationPayload } from "../types";
import { hashPassword } from "../utils";

interface DatabaseFileContent {
  users: Array<{
    id: number;
    email: string;
    password: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
  tasks: Array<Task>;
}

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE_PATH = path.join(DATA_DIR, "tasksphere_db.json");

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

class LocalStore {
  private data: DatabaseFileContent = { users: [], tasks: [] };
  private initialized = false;

  public async init() {
    if (this.initialized) return;

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.data = JSON.parse(raw);
        this.initialized = true;
        return;
      } catch (e) {
        console.warn("[LocalStore] Failed to read existing db file, recreating seed.");
      }
    }

    // Initialize with seed data
    const hashedPassword = await hashPassword("password123");
    const now = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    this.data = {
      users: [
        {
          id: 1,
          email: "sam@example.com",
          name: "Sam Smith",
          password: hashedPassword,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        },
        {
          id: 2,
          email: "alex@example.com",
          name: "Alex Morgan",
          password: hashedPassword,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Design TaskSphere UI & Design Tokens",
          name: "Design TaskSphere UI & Design Tokens",
          description: "Establish sleek Tailwind typography, dark mode glassmorphism, and responsive inspector modals.",
          status: "COMPLETED",
          priority: "high",
          dueDate: yesterday,
          category: "Design",
          done: true,
          createdAt: yesterday,
          updatedAt: yesterday,
          userId: 1
        },
        {
          id: 2,
          title: "Implement Real-Time Filter & Search Toolbar",
          name: "Implement Real-Time Filter & Search Toolbar",
          description: "Support live full-text search, status tabs, priority dropdowns, and due date categories.",
          status: "IN_PROGRESS",
          priority: "high",
          dueDate: today,
          category: "Feature",
          done: false,
          createdAt: yesterday,
          updatedAt: today,
          userId: 1
        },
        {
          id: 3,
          title: "Configure PostgreSQL & Prisma Schema Migrations",
          name: "Configure PostgreSQL & Prisma Schema Migrations",
          description: "Deploy relational indexes on (user_id, status) and (user_id, priority) for fast sorting and filtering.",
          status: "TODO",
          priority: "medium",
          dueDate: tomorrow,
          category: "Backend",
          done: false,
          createdAt: today,
          updatedAt: today,
          userId: 1
        },
        {
          id: 4,
          title: "Automate Jest Test Suite & CI Compilation",
          name: "Automate Jest Test Suite & CI Compilation",
          description: "Validate full controller coverage, request validation schemas, and build integrity.",
          status: "TODO",
          priority: "medium",
          dueDate: inThreeDays,
          category: "Quality",
          done: false,
          createdAt: today,
          updatedAt: today,
          userId: 1
        },
        {
          id: 5,
          title: "Security Hardening on HttpOnly JWT Cookies",
          name: "Security Hardening on HttpOnly JWT Cookies",
          description: "Audit CSRF protection, SameSite cookie options, and token expiration lifecycles.",
          status: "TODO",
          priority: "low",
          dueDate: null,
          category: "Security",
          done: false,
          createdAt: today,
          updatedAt: today,
          userId: 1
        }
      ]
    };

    this.save();
    this.initialized = true;
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[LocalStore] Failed to write db file:", e);
    }
  }

  // --- Task Methods ---

  public getAllTasksByUserId(userId: number): Task[] {
    return this.data.tasks
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTaskById(id: number, userId: number): Task | null {
    const task = this.data.tasks.find((t) => t.id === id && t.userId === userId);
    return task || null;
  }

  public createTask(payload: CreateTaskPayload, userId: number): Task {
    const title = payload.title || payload.name || "Untitled Task";
    const status = normalizeStatus(payload.status, payload.done);
    const priority = normalizePriority(payload.priority);
    const isDone = payload.done ?? (status === "COMPLETED");
    const now = new Date().toISOString();

    const maxId = this.data.tasks.reduce((max, t) => Math.max(max, t.id), 0);
    const newTask: Task = {
      id: maxId + 1,
      title,
      name: title,
      description: payload.description || "",
      status,
      priority: priority.toLowerCase() as any,
      dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : null,
      category: payload.category || "General",
      done: isDone,
      createdAt: now,
      updatedAt: now,
      userId
    };

    this.data.tasks.unshift(newTask);
    this.save();
    return newTask;
  }

  public updateTask(id: number, userId: number, updates: UpdateTaskPayload): Task | null {
    const index = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return null;

    const existing = this.data.tasks[index];
    const title = updates.title || updates.name || existing.title || existing.name || "Untitled Task";
    const status = updates.status !== undefined || updates.done !== undefined
      ? normalizeStatus(updates.status, updates.done !== undefined ? updates.done : existing.done)
      : existing.status;
    const isDone = updates.done !== undefined
      ? updates.done
      : (status === "COMPLETED");

    const updated: Task = {
      ...existing,
      title,
      name: title,
      description: updates.description !== undefined ? (updates.description || "") : existing.description,
      category: updates.category !== undefined ? (updates.category || "General") : existing.category,
      dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate).toISOString() : null) : existing.dueDate,
      priority: updates.priority !== undefined ? (normalizePriority(updates.priority).toLowerCase() as any) : existing.priority,
      status,
      done: isDone,
      updatedAt: new Date().toISOString()
    };

    this.data.tasks[index] = updated;
    this.save();
    return updated;
  }

  public toggleTaskDone(id: number, userId: number): Task | null {
    const task = this.getTaskById(id, userId);
    if (!task) return null;
    const newDone = !task.done;
    return this.updateTask(id, userId, {
      done: newDone,
      status: newDone ? "COMPLETED" : "TODO"
    });
  }

  public deleteTask(id: number, userId: number): boolean {
    const index = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (index === -1) return false;
    this.data.tasks.splice(index, 1);
    this.save();
    return true;
  }

  // --- User Methods ---

  public async createUser(userData: RegistrationPayload): Promise<User> {
    const hashedPassword = await hashPassword(userData.password);
    const maxId = this.data.users.reduce((max, u) => Math.max(max, u.id), 0);
    const now = new Date().toISOString();

    const newUser = {
      id: maxId + 1,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };

    this.data.users.push(newUser);
    this.save();

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
  }

  public findUserByEmail(email: string): User | null {
    const normalized = email.toLowerCase().trim();
    const user = this.data.users.find((u) => u.email === normalized);
    return user ? { ...user } : null;
  }

  public findUserById(id: number): Omit<User, "password"> | null {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  public async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  }
}

export const localStore = new LocalStore();

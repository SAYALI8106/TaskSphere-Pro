import { Request } from "express";
import { z } from "zod";

export const StatusSchema = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"], {
  message: "Status must be 'TODO', 'IN_PROGRESS', or 'COMPLETED'"
});
export type Status = z.infer<typeof StatusSchema>;

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "low", "medium", "high"], {
  message: "Priority must be 'LOW', 'MEDIUM', 'HIGH', 'low', 'medium', or 'high'"
});
export type Priority = z.infer<typeof PrioritySchema>;

export const TaskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().max(200, "Title must not exceed 200 characters").default(""),
  name: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(2000, "Description must not exceed 2000 characters").optional().nullable(),
  status: StatusSchema.default("TODO"),
  priority: PrioritySchema.default("MEDIUM"),
  dueDate: z.string().or(z.date()).optional().nullable(),
  category: z.string().trim().max(50).optional().nullable().default("General"),
  done: z.boolean().default(false),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  userId: z.number().int().positive()
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskPayloadSchema = z.object({
  title: z.string().trim().min(1, "Title/Name is required").max(200).optional(),
  name: z.string().trim().min(1, "Name is required").max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: StatusSchema.optional().default("TODO"),
  priority: PrioritySchema.optional().default("MEDIUM"),
  dueDate: z.string().datetime({ offset: true }).or(z.string()).optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  done: z.boolean().optional()
}).refine(data => data.title || data.name, {
  message: "Title or name is required",
  path: ["title"]
});

export type CreateTaskPayload = z.infer<typeof CreateTaskPayloadSchema>;

export const UpdateTaskPayloadSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: StatusSchema.optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.string().optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  done: z.boolean().optional()
});

export type UpdateTaskPayload = z.infer<typeof UpdateTaskPayloadSchema>;

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email("Invalid email"),
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters"),
  password: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string())
});

export type User = z.infer<typeof UserSchema>;

export const RegistrationPayloadSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must not exceed 100 characters"),
  name: z
    .string()
    .trim()
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters")
});

export type RegistrationPayload = z.infer<typeof RegistrationPayloadSchema>;

export const LoginPayloadSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required")
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export interface AuthRequest extends Request {
  userId?: number;
}

import { getTaskById, getAllTasksByUserId } from "../models/taskModel";
import prisma from "../config/prisma";

jest.mock("../config/prisma", () => ({
  task: {
    findFirst: jest.fn(),
    findMany: jest.fn()
  }
}));

test("getTaskById returns null if missing", async () => {
  (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

  const task = await getTaskById(1, 999);
  expect(task).toBeNull();
});

test("getAllTasksByUserId returns list of tasks", async () => {
  (prisma.task.findMany as jest.Mock).mockResolvedValue([
    {
      id: 1,
      title: "Test Task",
      name: "Test Task",
      status: "TODO",
      priority: "MEDIUM",
      done: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 999
    }
  ]);

  const tasks = await getAllTasksByUserId(999);
  expect(tasks).toHaveLength(1);
  expect(tasks[0].title).toBe("Test Task");
});

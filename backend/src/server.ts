import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth";
import tasksRouter from "./routes/tasks";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";
import { StatusCodes } from "http-status-codes";
import prisma from "./config/prisma";
import { fetchEnvVar } from "./utils";
import { initDatabase, isUsingPostgres } from "./config/dbConnection";

const app = express();
const PORT = process.env.PORT || 5001;

// Validate core required environment variables
for (const envVar of [
  "FRONTEND_APP_URL",
  "NODE_ENV",
  "DATABASE_URL",
  "JWT_SECRET"
]) {
  fetchEnvVar(envVar);
}

app.use(
  cors({
    origin: process.env.FRONTEND_APP_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Health check endpoint
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const isPg = isUsingPostgres();
    if (isPg) {
      await prisma.$executeRaw`SELECT 1`;
    }

    res.json({
      status: "ok",
      database: isPg ? "connected (PostgreSQL)" : "connected (Embedded Local Engine)",
      engine: isPg ? "PostgreSQL via Prisma ORM" : "TaskSphere Persistent Local Store",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (e: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      database: "disconnected",
      message: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Application Routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: "Route not found",
    path: req.path
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`🚀 TaskSphere Pro Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  await initDatabase();
});

export default app;

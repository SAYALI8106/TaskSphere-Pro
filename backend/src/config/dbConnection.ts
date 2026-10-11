import prisma from "./prisma";
import { localStore } from "./localStore";

let isPostgresAvailable = false;
let checkPerformed = false;

export const initDatabase = async (): Promise<{ engine: "postgresql" | "local-embedded"; healthy: boolean }> => {
  if (process.env.NODE_ENV === "test") {
    return { engine: "postgresql", healthy: true };
  }

  await localStore.init();

  if (checkPerformed) {
    return {
      engine: isPostgresAvailable ? "postgresql" : "local-embedded",
      healthy: true
    };
  }

  try {
    const probePromise = prisma.$executeRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database probe timeout")), 1500)
    );

    await Promise.race([probePromise, timeoutPromise]);
    isPostgresAvailable = true;
    checkPerformed = true;
    console.log("✅ [TaskSphere] PostgreSQL connection established successfully via Prisma.");
    return { engine: "postgresql", healthy: true };
  } catch {
    isPostgresAvailable = false;
    checkPerformed = true;
    console.log("ℹ️ [TaskSphere] PostgreSQL not detected on localhost:5432.");
    console.log("🚀 [TaskSphere] Active mode: Embedded Local Store (zero external dependencies required).");
    console.log("🔑 [TaskSphere] Demo Account: email: sam@example.com | password: password123");
    return { engine: "local-embedded", healthy: true };
  }
};

export const isUsingPostgres = (): boolean => {
  if (process.env.NODE_ENV === "test") return true;
  return isPostgresAvailable;
};

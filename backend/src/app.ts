import express from "express";
import healthRoutes from "./api/routes/healthRoutes.js";
import {
  createReadinessRouter,
  type DatabaseCheck,
} from "./api/routes/readinessRoutes.js";
interface AppDependencies {
  checkDatabase: DatabaseCheck;
}

export function createApp(dependencies: AppDependencies) {
  const app = express();

  app.use(express.json());

  app.use("/health", healthRoutes);

  app.use("/ready", createReadinessRouter(dependencies.checkDatabase));

  return app;
}

import { Router } from "express";

export type DatabaseCheck = () => Promise<void>;

export function createReadinessRouter(checkDatabase: DatabaseCheck) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      await checkDatabase();

      res.status(200).json({ status: "ready" });
    } catch {
      console.error("Readiness check failed");

      res.status(503).json({ status: "not_ready" });
    }
  });

  return router;
}

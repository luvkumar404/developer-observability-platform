import { Router } from "express";
import type { HealthStatus } from "@observability/contracts";

export const healthRouter = Router();

function healthPayload(): HealthStatus {
  return {
    status: "ok",
    service: "observability-api",
    timestamp: new Date().toISOString(),
  };
}

healthRouter.get("/health", (_req, res) => {
  res.status(200).json(healthPayload());
});

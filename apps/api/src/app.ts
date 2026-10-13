import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { healthRouter } from "./modules/health/health.routes.js";

export const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "256kb" }));

app.use(healthRouter);
app.use("/api/v1", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

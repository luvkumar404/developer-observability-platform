import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";

function isMalformedJsonError(err: unknown): boolean {
  if (!(err instanceof SyntaxError)) {
    return false;
  }

  return "body" in err || (hasStatus(err) && err.status === 400);
}

function hasStatus(err: object): err is { status: number } {
  return "status" in err && typeof (err as { status: unknown }).status === "number";
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isMalformedJsonError(err)) {
    res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Malformed JSON request body",
      },
    });
    return;
  }

  const isProduction = env.NODE_ENV === "production";
  const message = !isProduction && err instanceof Error ? err.message : "Internal server error";

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  });
};

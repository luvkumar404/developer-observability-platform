import type { Request, Response } from "express";
import type { ApiErrorBody } from "@observability/contracts";

export function notFoundHandler(_req: Request, res: Response<ApiErrorBody>): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested resource was not found",
    },
  });
}

import crypto from "crypto";
import { logger } from "#http";
import type { ErrorRequestHandler } from "express";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }

  const traceId = req.id ?? crypto.randomUUID();
  const log = req.log ?? logger;

  log.error(
    { err, traceId },
    "Unhandled infrastructure/unexpected error occurred",
  );
  res.status(500).json({
    message: "Internal Server Error",
    traceId,
  });
};

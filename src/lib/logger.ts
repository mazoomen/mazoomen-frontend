// ── Centralized Logger ───────────────────────────────────────────────────
// Replaces scattered console.error calls with a structured logging utility.
// Can be extended to send errors to a monitoring service (e.g. Sentry).

import { IS_DEV } from "./env";

type LogLevel = "error" | "warn" | "info" | "debug";

function log(level: LogLevel, message: string, context?: unknown): void {
  if (level === "debug" && !IS_DEV) return;

  const prefix = `[Mazoomen:${level.toUpperCase()}]`;

  switch (level) {
    case "error":
      // eslint-disable-next-line no-console
      console.error(prefix, message, context ?? "");
      break;
    case "warn":
      // eslint-disable-next-line no-console
      console.warn(prefix, message, context ?? "");
      break;
    case "info":
      // eslint-disable-next-line no-console
      console.info(prefix, message, context ?? "");
      break;
    case "debug":
      // eslint-disable-next-line no-console
      console.debug(prefix, message, context ?? "");
      break;
  }
}

export const logger = {
  error: (message: string, context?: unknown) => log("error", message, context),
  warn: (message: string, context?: unknown) => log("warn", message, context),
  info: (message: string, context?: unknown) => log("info", message, context),
  debug: (message: string, context?: unknown) => log("debug", message, context),
};

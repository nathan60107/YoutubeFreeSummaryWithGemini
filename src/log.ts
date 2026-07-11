/**
 * Prefixed console logging with an in-memory ring buffer. Every `log`/`warn`/`error` call is both
 * printed (behind a filterable `[YFAS]` prefix) and captured into a bounded RAM buffer so a debug
 * report can include recent history without ever touching storage. Kept separate from `utils.ts`
 * so the many modules that only need logging don't pull in the DOM/GM helpers alongside it.
 */

/** Shared console prefix so every log is filterable and never lost behind a missing tag. */
const logPrefix = "[YFAS]";

/** Log severity levels captured into the in-memory buffer. */
type LogLevel = "log" | "warn" | "error";
/** A single captured log line. */
interface LogEntry {
  /** Epoch ms when the line was logged. */
  t: number;
  level: LogLevel;
  /** The stringified log arguments, joined by spaces. */
  msg: string;
}

/**
 * In-memory ring buffer of the most recent log lines from all three streams. Kept in RAM only
 * (never persisted) so a debug report can include recent history without touching storage.
 */
const logBuffer: LogEntry[] = [];
/** Cap on retained log lines; oldest are dropped past this to bound memory use. */
const maxLogEntries = 300;

/** Best-effort conversion of a single log argument to a readable string (expanding Errors/objects). */
function stringifyArg(arg: unknown): string {
  if(typeof arg === "string")
    return arg;
  if(arg instanceof Error)
    return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
  try {
    return JSON.stringify(arg);
  }
  catch {
    return String(arg);
  }
}

/** Appends a line to {@linkcode logBuffer}, trimming it back down to {@linkcode maxLogEntries}. */
function record(level: LogLevel, args: unknown[]): void {
  logBuffer.push({ t: Date.now(), level, msg: args.map(stringifyArg).join(" ") });
  if(logBuffer.length > maxLogEntries)
    logBuffer.splice(0, logBuffer.length - maxLogEntries);
}

/** Prefixed `console.log`, also captured into the in-memory log buffer. */
export const log = (...args: unknown[]) => { record("log", args); console.log(logPrefix, ...args); };
/** Prefixed `console.warn`, also captured into the in-memory log buffer. */
export const warn = (...args: unknown[]) => { record("warn", args); console.warn(logPrefix, ...args); };
/** Prefixed `console.error`, also captured into the in-memory log buffer. */
export const error = (...args: unknown[]) => { record("error", args); console.error(logPrefix, ...args); };

/** Returns the captured log lines (oldest first), each formatted as `[ISO time] LEVEL message`. */
export function getRecentLogs(): string[] {
  return logBuffer.map(e => `[${new Date(e.t).toISOString()}] ${e.level.toUpperCase()} ${e.msg}`);
}

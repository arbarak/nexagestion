/* Logger service for structured logging across the application */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: unknown;
  stack?: string;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    const contextStr = context
      ? ` ${JSON.stringify(context)}`
      : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: unknown
  ): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      error,
    };

    if (error instanceof Error) {
      entry.stack = error.stack;
    }

    const formattedLog = this.formatLog(entry);

    // Use appropriate console method based on level
    switch (level) {
      case "debug":
        console.debug(formattedLog);
        break;
      case "info":
        console.info(formattedLog);
        break;
      case "warn":
        console.warn(formattedLog);
        break;
      case "error":
        console.error(formattedLog);
        if (error) {
          console.error(error);
        }
        break;
    }

    // TODO: In production, send to logging service (e.g., Sentry, LogRocket, CloudWatch)
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.log("error", message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other parts of the application
export type { LogLevel, LogContext, LogEntry };

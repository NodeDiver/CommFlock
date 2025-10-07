/**
 * Logger utility for structured logging across the application.
 * Provides a centralized logging interface that can be extended with
 * external logging services (e.g., Sentry, DataDog, Logtail).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context ? context : "");
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    console.log(`[INFO] ${message}`, context ? context : "");
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context ? context : "");
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorInfo =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error;

    console.error(`[ERROR] ${message}`, {
      error: errorInfo,
      ...(context || {}),
    });

    // TODO: Send to external error tracking service (Sentry, etc.)
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case "debug":
        this.debug(message, context);
        break;
      case "info":
        this.info(message, context);
        break;
      case "warn":
        this.warn(message, context);
        break;
      case "error":
        this.error(message, context);
        break;
    }
  }
}

export const logger = new Logger();

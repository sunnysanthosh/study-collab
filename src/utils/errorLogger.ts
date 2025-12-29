/**
 * Frontend Error Logger
 * Logs errors to console and optionally to backend
 */

interface ErrorLog {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  timestamp: string;
  context?: Record<string, any>;
}

class FrontendErrorLogger {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  /**
   * Log error to console and optionally send to backend
   */
  logError(error: Error | string, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      userId: this.getUserId(),
      timestamp: new Date().toISOString(),
      context,
    };

    // Always log to console
    console.error('Frontend Error:', errorLog);

    // Send to backend in production (optional)
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(errorLog).catch(() => {
        // Silently fail if backend is unavailable
      });
    }
  }

  /**
   * Log warning
   */
  logWarning(message: string, context?: Record<string, any>): void {
    console.warn('Frontend Warning:', { message, context, timestamp: new Date().toISOString() });
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: Record<string, any>): void {
    console.info('Frontend Info:', { message, context, timestamp: new Date().toISOString() });
  }

  /**
   * Get user ID from localStorage
   */
  private getUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined;
    try {
      const userStr = localStorage.getItem('studycollab_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore parse errors
    }
    return undefined;
  }

  /**
   * Send error log to backend
   */
  private async sendToBackend(errorLog: ErrorLog): Promise<void> {
    try {
      const token = localStorage.getItem('studycollab_token');
      await fetch(`${this.apiUrl}/api/logs/error`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(errorLog),
      });
    } catch {
      // Silently fail
    }
  }
}

export const errorLogger = new FrontendErrorLogger();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error || new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
      {
        type: 'unhandledRejection',
      }
    );
  });
}


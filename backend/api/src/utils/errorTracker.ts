import { logError, logWarning } from './logger';

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  requestId?: string;
  operation?: string;
  type?: string;
  metadata?: Record<string, any>;
  [key: string]: any; // Allow additional context fields
}

export class ErrorTracker {
  private static errorCounts: Map<string, number> = new Map();
  private static errorThreshold = 10; // Alert after 10 similar errors

  /**
   * Track and log errors with context
   */
  static trackError(
    error: Error,
    context: ErrorContext = {}
  ): void {
    const errorKey = `${error.name}:${error.message}`;
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);

    // Log error with full context
    logError(error, {
      ...context,
      errorCount: count,
      errorKey,
    });

    // Alert if error threshold exceeded
    if (count >= this.errorThreshold && count % this.errorThreshold === 0) {
      logWarning(`Error threshold exceeded for: ${errorKey}`, {
        count,
        threshold: this.errorThreshold,
        ...context,
      });
    }
  }

  /**
   * Track API errors
   */
  static trackApiError(
    error: Error,
    endpoint: string,
    method: string,
    context: ErrorContext = {}
  ): void {
    this.trackError(error, {
      ...context,
      operation: 'API_REQUEST',
      metadata: {
        endpoint,
        method,
      },
    });
  }

  /**
   * Track database errors
   */
  static trackDatabaseError(
    error: Error,
    query: string,
    context: ErrorContext = {}
  ): void {
    this.trackError(error, {
      ...context,
      operation: 'DATABASE_QUERY',
      metadata: {
        query: query.substring(0, 200), // Truncate long queries
      },
    });
  }

  /**
   * Track authentication errors
   */
  static trackAuthError(
    error: Error,
    email?: string,
    context: ErrorContext = {}
  ): void {
    this.trackError(error, {
      ...context,
      operation: 'AUTHENTICATION',
      userEmail: email,
      metadata: {
        isSecurityIssue: true,
      },
    });
  }

  /**
   * Track file upload errors
   */
  static trackFileError(
    error: Error,
    filename?: string,
    context: ErrorContext = {}
  ): void {
    this.trackError(error, {
      ...context,
      operation: 'FILE_UPLOAD',
      metadata: {
        filename,
      },
    });
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errorCounts.forEach((count, key) => {
      stats[key] = count;
    });
    return stats;
  }

  /**
   * Reset error counts (useful for testing)
   */
  static resetCounts(): void {
    this.errorCounts.clear();
  }
}


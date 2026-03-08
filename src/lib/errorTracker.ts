import { apiRequest } from '@/lib/apiClient';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorLogData {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  componentName?: string;
  severity: ErrorSeverity;
  metadata?: Record<string, unknown>;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private userId: string | null = null;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  public setUserId(userId: string | null) {
    this.userId = userId;
  }

  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.logError({
        errorType: 'UncaughtError',
        errorMessage: event.message,
        errorStack: event.error?.stack,
        componentName: 'Global',
        severity: 'high',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        errorType: 'UnhandledPromiseRejection',
        errorMessage: event.reason?.message || String(event.reason),
        errorStack: event.reason?.stack,
        componentName: 'Global',
        severity: 'high',
        metadata: {
          promise: event.promise,
        },
      });
    });
  }

  public async logError(data: ErrorLogData): Promise<void> {
    try {
      await apiRequest<{ id: string; createdAt: string }>('/error-logs', {
        method: 'POST',
        body: JSON.stringify({
          errorType: data.errorType,
          errorMessage: data.errorMessage,
          errorStack: data.errorStack,
          componentName: data.componentName,
          pageUrl: window.location.href,
          userAgent: navigator.userAgent,
          severity: data.severity,
          metadata: {
            ...(data.metadata || {}),
            userId: this.userId,
          },
        }),
      });

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.error('[ErrorTracker]', data);
      }
    } catch (e) {
      console.error('Error in error tracker:', e);
    }
  }

  public captureException(
    error: Error,
    componentName?: string,
    severity: ErrorSeverity = 'medium'
  ): void {
    this.logError({
      errorType: error.name || 'Error',
      errorMessage: error.message,
      errorStack: error.stack,
      componentName,
      severity,
    });
  }

  public captureMessage(
    message: string,
    severity: ErrorSeverity = 'low',
    metadata?: Record<string, unknown>
  ): void {
    this.logError({
      errorType: 'Message',
      errorMessage: message,
      severity,
      metadata,
    });
  }
}

export const errorTracker = ErrorTracker.getInstance();

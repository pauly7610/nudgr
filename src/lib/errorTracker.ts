import { supabase } from '@/integrations/supabase/client';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorLogData {
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  componentName?: string;
  severity: ErrorSeverity;
  metadata?: Record<string, any>;
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
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('error_logs').insert({
        user_id: user?.user?.id || this.userId,
        error_type: data.errorType,
        error_message: data.errorMessage,
        error_stack: data.errorStack,
        component_name: data.componentName,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        severity: data.severity,
        metadata: data.metadata || {},
      });

      if (error) {
        console.error('Failed to log error:', error);
      }

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
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
    metadata?: Record<string, any>
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

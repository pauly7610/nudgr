import { z } from 'zod';

// Email validation
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

// Password validation
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(128, { message: "Password must be less than 128 characters" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" });

// Name validation
export const nameSchema = z.string()
  .trim()
  .min(1, { message: "Name cannot be empty" })
  .max(100, { message: "Name must be less than 100 characters" })
  .regex(/^[a-zA-Z\s'-]+$/, { message: "Name contains invalid characters" });

// UUID validation
export const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });

// URL validation
export const urlSchema = z.string()
  .url({ message: "Invalid URL format" })
  .max(2048, { message: "URL must be less than 2048 characters" });

// API Key validation
export const apiKeySchema = z.string()
  .trim()
  .min(32, { message: "API key must be at least 32 characters" })
  .max(256, { message: "API key must be less than 256 characters" })
  .regex(/^[a-zA-Z0-9_-]+$/, { message: "API key contains invalid characters" });

// Text content validation (prevents XSS)
export const sanitizedTextSchema = z.string()
  .trim()
  .max(10000, { message: "Text must be less than 10000 characters" })
  .transform((val) => {
    // Remove potentially dangerous HTML tags
    return val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  });

// Numeric range validation
export const numericRangeSchema = (min: number, max: number) =>
  z.number()
    .min(min, { message: `Value must be at least ${min}` })
    .max(max, { message: `Value must be at most ${max}` });

// Date range validation
export const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.startDate <= data.endDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Cohort criteria validation
export const cohortCriteriaSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().optional(),
  criteria: z.record(z.any()),
});

// Friction event validation
export const frictionEventSchema = z.object({
  sessionId: uuidSchema,
  eventType: z.enum([
    'click_rage',
    'dead_click',
    'error_click',
    'form_error',
    'slow_load',
    'navigation_loop',
    'scroll_thrash',
  ]),
  pageUrl: urlSchema,
  timestamp: z.string().datetime(),
  elementSelector: z.string().optional(),
  userAction: z.string().optional(),
  severityScore: z.number().int().min(1).max(10),
  errorMessage: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Export validation helper
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
};

// SQL Injection prevention helper
export const preventSQLInjection = (input: string): string => {
  // Remove common SQL injection patterns
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '') // Remove extended procedures
    .replace(/sp_/gi, ''); // Remove stored procedures
};

// XSS prevention helper
export const preventXSS = (input: string): string => {
  const element = document.createElement('div');
  element.textContent = input;
  return element.innerHTML;
};

// Path traversal prevention
export const sanitizePath = (path: string): string => {
  return path
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^\/+/, '') // Remove leading slashes
    .trim();
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

import { config } from "dotenv";
import { z } from "zod";

config();

const emptyStringToUndefined = (value: unknown): unknown => {
  return value === "" ? undefined : value;
};

const booleanFromEnv = (defaultValue: boolean) => {
  return z.preprocess((value) => {
    if (value === undefined || value === "") {
      return defaultValue;
    }

    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(normalized)) {
        return true;
      }
      if (["false", "0", "no", "off"].includes(normalized)) {
        return false;
      }
    }

    return value;
  }, z.boolean());
};

const optionalUrl = z.preprocess(emptyStringToUndefined, z.string().url().optional());
const optionalSecret = z.preprocess(emptyStringToUndefined, z.string().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  DISABLE_AUTH: booleanFromEnv(false),
  APP_ORIGIN: optionalUrl,
  API_PUBLIC_ORIGIN: optionalUrl,
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  AI_PROVIDER: z.enum(["heuristic", "mock"]).default("heuristic"),
  AI_PROVIDER_MODEL: z.string().default("nudgr-v1"),
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: booleanFromEnv(false),
  SESSION_RECORDING_RETENTION_DAYS: z.coerce.number().int().min(1).default(7),
  GOOGLE_OAUTH_CLIENT_ID: optionalSecret,
  GOOGLE_OAUTH_CLIENT_SECRET: optionalSecret,
  GOOGLE_OAUTH_REDIRECT_URI: optionalUrl
});

export const env = envSchema.parse(process.env);

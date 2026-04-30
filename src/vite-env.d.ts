/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly BASE_URL: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_REALTIME_WS_URL?: string;
  readonly VITE_DEBUG_TELEMETRY?: string;
  readonly VITE_AUTH_DISABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

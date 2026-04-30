const ACCESS_TOKEN_STORAGE_KEY = "nudgr_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "nudgr_refresh_token";

interface AuthTokens {
  accessToken: string;
  refreshToken?: string | null;
}

interface ApiRequestInit extends RequestInit {
  skipAuthRefresh?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

export const getApiBaseUrl = (): string => {
  return (import.meta.env.VITE_API_BASE_URL || window.location.origin).replace(/\/$/, "");
};

export const setAccessToken = (token: string | null): void => {
  if (!token) {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
};

export const setRefreshToken = (token: string | null): void => {
  if (!token) {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, token);
};

export const setAuthTokens = ({ accessToken, refreshToken }: AuthTokens): void => {
  setAccessToken(accessToken);
  if (refreshToken !== undefined) {
    setRefreshToken(refreshToken);
  }
};

export const clearAuthTokens = (): void => {
  setAccessToken(null);
  setRefreshToken(null);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

const isFormDataBody = (body: BodyInit | null | undefined): boolean => {
  return typeof FormData !== "undefined" && body instanceof FormData;
};

const parseResponsePayload = async (response: Response): Promise<unknown> => {
  const hasJsonBody = response.headers.get("content-type")?.includes("application/json");
  if (!hasJsonBody) {
    return null;
  }

  return response.json();
};

const extractErrorMessage = (payload: unknown, status: number): string => {
  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message: unknown }).message);
  }

  return `Request failed with ${status}`;
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      clearAuthTokens();
      return null;
    }

    const tokens = payload as Partial<AuthTokens> | null;
    if (!tokens?.accessToken) {
      clearAuthTokens();
      return null;
    }

    setAuthTokens({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? refreshToken,
    });

    return tokens.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

export const apiRequest = async <T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> => {
  const { skipAuthRefresh, ...requestInit } = init;
  const token = getAccessToken();
  const headers = new Headers(requestInit.headers);

  if (!headers.has("Content-Type") && requestInit.body && !isFormDataBody(requestInit.body)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...requestInit,
    headers
  });

  let payload = await parseResponsePayload(response);

  if (response.status === 401 && !skipAuthRefresh) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...requestInit,
        headers,
      });
      payload = await parseResponsePayload(response);
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, response.status));
  }

  return payload as T;
};

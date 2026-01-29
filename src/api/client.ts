import { refreshAccessToken } from "@/synapse/matrix";
import { GetConfig } from "@/utils/config";
import { MatrixError, displayError } from "@/utils/error";

export class HttpError extends Error {
  status: number;
  body: MatrixError | null;

  constructor(message: string, status: number, body: MatrixError | null = null) {
    super(message);
    this.status = status;
    this.body = body;
    this.name = "HttpError";
  }
}

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Core API client that handles authentication and token refresh
 */
export async function apiClient<T>(url: string, options: FetchOptions = {}): Promise<T> {
  // Check if token needs refresh before making the request
  const accessTokenExpiresAt = localStorage.getItem("access_token_expires_at");
  const refreshToken = localStorage.getItem("refresh_token");

  if (accessTokenExpiresAt && refreshToken) {
    const expiresAt = parseInt(accessTokenExpiresAt, 10);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    // Refresh if token has expired or will expire in less than 2 minutes
    if (timeUntilExpiry < 120000) {
      console.log(`Token ${timeUntilExpiry <= 0 ? "expired" : "expiring soon"}, refreshing before API call...`);
      await refreshAccessToken();
    }
  }

  const token = localStorage.getItem("access_token");
  const config = GetConfig();

  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: config.corsCredentials as RequestCredentials,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorBody: MatrixError | null = null;
      try {
        errorBody = await response.json();
      } catch {
        // Ignore JSON parse errors
      }

      const errMsg = errorBody?.errcode
        ? displayError(errorBody.errcode, response.status, errorBody.error)
        : displayError("M_INVALID", response.status, response.statusText);

      throw new HttpError(errMsg, response.status, errorBody);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (err) {
    if (err instanceof HttpError) {
      throw err;
    }
    throw new HttpError(err instanceof Error ? err.message : "Unknown error", 0);
  }
}

/**
 * Get the base URL for API calls
 */
export function getBaseUrl(): string {
  const baseUrl = localStorage.getItem("base_url");
  if (!baseUrl) {
    throw new Error("Base URL not set. Please log in first.");
  }
  return baseUrl;
}

/**
 * Get the home server name
 */
export function getHomeServer(): string {
  const homeServer = localStorage.getItem("home_server");
  if (!homeServer) {
    throw new Error("Home server not set. Please log in first.");
  }
  return homeServer;
}

/**
 * Build a full API URL
 */
export function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const baseUrl = getBaseUrl();
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Filter undefined values from an object
 */
export function filterUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as Partial<T>;
}

/**
 * Filter null values from an object (for JSON serialization)
 * Note: user_type must remain null to reset it
 */
export function filterNullValues(key: string, value: unknown): unknown {
  if (value === null && key !== "user_type") {
    return undefined;
  }
  return value;
}

/**
 * Convert sort order to API format
 */
export function getSearchOrder(order: "asc" | "desc" | "ASC" | "DESC"): "f" | "b" {
  return order.toLowerCase() === "desc" ? "b" : "f";
}

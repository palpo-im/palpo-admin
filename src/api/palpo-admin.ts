import type {
  ServerStatusResponse,
  ServerProcessResponse,
  ServerNotification,
  PaymentsResponse,
} from "@/types/api";

// Get Palpo admin base URL
function getPalpoAdminUrl(): string {
  return localStorage.getItem("palpo_admin_url") || "";
}

// Get Palpo admin token
function getPalpoToken(): string {
  return localStorage.getItem("palpo_token") || "";
}

// Check if Palpo admin is enabled
export function isPalpoAdminEnabled(): boolean {
  return !!getPalpoAdminUrl() && !!getPalpoToken();
}

// Generic fetch for Palpo admin API
async function palpoApiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const baseUrl = getPalpoAdminUrl();
  const token = getPalpoToken();

  if (!baseUrl || !token) {
    throw new Error("Palpo admin not configured");
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Palpo admin API error: ${response.statusText}`);
  }

  return response.json();
}

// Get server status
export async function getServerStatus(): Promise<ServerStatusResponse> {
  return palpoApiClient<ServerStatusResponse>("/status");
}

// Trigger status check
export async function triggerStatusCheck(): Promise<void> {
  await palpoApiClient("/status/check", { method: "POST" });
}

// Get current running process
export async function getServerProcess(): Promise<ServerProcessResponse | null> {
  try {
    return await palpoApiClient<ServerProcessResponse>("/process");
  } catch {
    return null;
  }
}

// Run a server command
export async function runServerCommand(command: string): Promise<void> {
  await palpoApiClient("/command", {
    method: "POST",
    body: JSON.stringify({ command }),
  });
}

// Get server notifications
export async function getServerNotifications(): Promise<ServerNotification[]> {
  const result = await palpoApiClient<{ notifications: ServerNotification[] }>("/notifications");
  return result.notifications || [];
}

// Dismiss a notification
export async function dismissNotification(eventId: string): Promise<void> {
  await palpoApiClient(`/notifications/${eventId}`, { method: "DELETE" });
}

// Get payments/billing info
export async function getPayments(): Promise<PaymentsResponse> {
  return palpoApiClient<PaymentsResponse>("/payments");
}

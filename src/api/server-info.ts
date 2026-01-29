import { getBaseUrl } from "./client";

import type {
  PaymentsResponse,
  RecurringCommand,
  ScheduledCommand,
  ServerCommandsResponse,
  ServerNotificationsResponse,
  ServerProcessResponse,
  ServerStatusResponse,
} from "@/types/api";

// Helper to make Palpo admin API calls
async function palpoAdminFetch<T>(
  palpoAdminUrl: string,
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 503) {
      return null; // Maintenance mode
    }

    if (!response.ok) {
      console.error(`Error fetching ${path}: ${response.status} ${response.statusText}`);
      return null;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

// Get Synapse server version
export async function getServerVersion(): Promise<string | null> {
  const baseUrl = getBaseUrl();
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${baseUrl}/_synapse/admin/v1/server_version`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.server_version;
  } catch {
    return null;
  }
}

// Get supported Matrix features
export async function getSupportedFeatures(): Promise<{ versions: string[]; unstable_features: Record<string, boolean> } | null> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/_matrix/client/versions`);

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

// Palpo specific APIs

// Get server running process/lock status
export async function getServerRunningProcess(
  palpoAdminUrl: string,
  burstCache = false
): Promise<ServerProcessResponse> {
  let url = `${palpoAdminUrl}/lock`;
  if (burstCache) {
    url += `?time=${Date.now()}`;
  }

  const result = await palpoAdminFetch<{ locked_at: string; command: string }>(palpoAdminUrl, "/lock");

  if (!result) {
    return { locked_at: "", command: "", maintenance: false };
  }

  return { ...result, maintenance: false };
}

// Get server status
export async function getServerStatus(
  palpoAdminUrl: string,
  burstCache = false
): Promise<ServerStatusResponse> {
  let url = "/status";
  if (burstCache) {
    url += `?time=${Date.now()}`;
  }

  const result = await palpoAdminFetch<Omit<ServerStatusResponse, "success">>(palpoAdminUrl, url);

  if (!result) {
    return { success: false, ok: false, host: "", results: [] };
  }

  return { success: true, ...result };
}

// Get server notifications
export async function getServerNotifications(
  palpoAdminUrl: string,
  burstCache = false
): Promise<ServerNotificationsResponse> {
  let url = "/notifications";
  if (burstCache) {
    url += `?time=${Date.now()}`;
  }

  const result = await palpoAdminFetch<ServerNotificationsResponse["notifications"]>(palpoAdminUrl, url);

  if (!result) {
    return { success: false, notifications: [] };
  }

  return { success: true, notifications: Array.isArray(result) ? result : [] };
}

// Delete server notifications
export async function deleteServerNotifications(palpoAdminUrl: string): Promise<{ success: boolean }> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}/notifications`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.status === 204 };
  } catch {
    return { success: false };
  }
}

// Get server commands
export async function getServerCommands(
  palpoAdminUrl: string
): Promise<{ maintenance: boolean; commands: ServerCommandsResponse[] }> {
  const result = await palpoAdminFetch<ServerCommandsResponse[]>(palpoAdminUrl, "/commands");

  if (!result) {
    return { maintenance: false, commands: [] };
  }

  return { maintenance: false, commands: result };
}

// Run server command
export async function runServerCommand(
  palpoAdminUrl: string,
  command: string,
  additionalArgs: Record<string, unknown> = {}
): Promise<{ success: boolean; maintenance: boolean }> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}/commands`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ command, ...additionalArgs }),
    });

    if (response.status === 503) {
      return { success: false, maintenance: true };
    }

    return { success: response.status === 204, maintenance: false };
  } catch {
    return { success: false, maintenance: false };
  }
}

// Get scheduled commands
export async function getScheduledCommands(palpoAdminUrl: string): Promise<ScheduledCommand[]> {
  const result = await palpoAdminFetch<ScheduledCommand[]>(palpoAdminUrl, "/schedules");
  return result || [];
}

// Create scheduled command
export async function createScheduledCommand(
  palpoAdminUrl: string,
  command: Partial<ScheduledCommand>
): Promise<ScheduledCommand> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${palpoAdminUrl}/schedules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error("Failed to create scheduled command");
  }

  if (response.status === 204) {
    return command as ScheduledCommand;
  }

  return response.json();
}

// Update scheduled command
export async function updateScheduledCommand(
  palpoAdminUrl: string,
  command: ScheduledCommand
): Promise<ScheduledCommand> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${palpoAdminUrl}/schedules`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const jsonErr = await response.json();
    throw new Error(jsonErr.error || "Failed to update scheduled command");
  }

  if (response.status === 204) {
    return command;
  }

  return response.json();
}

// Delete scheduled command
export async function deleteScheduledCommand(
  palpoAdminUrl: string,
  id: string
): Promise<{ success: boolean }> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}/schedules/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

// Get recurring commands
export async function getRecurringCommands(palpoAdminUrl: string): Promise<RecurringCommand[]> {
  const result = await palpoAdminFetch<RecurringCommand[]>(palpoAdminUrl, "/recurrings");
  return result || [];
}

// Create recurring command
export async function createRecurringCommand(
  palpoAdminUrl: string,
  command: Partial<RecurringCommand>
): Promise<RecurringCommand> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${palpoAdminUrl}/recurrings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error("Failed to create recurring command");
  }

  if (response.status === 204) {
    return command as RecurringCommand;
  }

  return response.json();
}

// Update recurring command
export async function updateRecurringCommand(
  palpoAdminUrl: string,
  command: RecurringCommand
): Promise<RecurringCommand> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${palpoAdminUrl}/recurrings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error("Failed to update recurring command");
  }

  if (response.status === 204) {
    return command;
  }

  return response.json();
}

// Delete recurring command
export async function deleteRecurringCommand(
  palpoAdminUrl: string,
  id: string
): Promise<{ success: boolean }> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}/recurrings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: response.ok };
  } catch {
    return { success: false };
  }
}

// Get payments
export async function getPayments(palpoAdminUrl: string): Promise<PaymentsResponse> {
  const token = localStorage.getItem("access_token");

  try {
    const response = await fetch(`${palpoAdminUrl}/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 503) {
      return { payments: [], total: 0, maintenance: true };
    }

    if (response.status === 204) {
      return { payments: [], total: 0 };
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.status}`);
    }

    return response.json();
  } catch {
    return { payments: [], total: 0 };
  }
}

// Download invoice
export async function downloadInvoice(palpoAdminUrl: string, transactionId: string): Promise<void> {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${palpoAdminUrl}/payments/${transactionId}/invoice`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch invoice: ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `invoice_${transactionId}.pdf`;

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

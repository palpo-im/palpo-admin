import { apiClient, buildUrl, filterNullValues, getBaseUrl, getSearchOrder } from "./client";

import type {
  AccountDataModel,
  Device,
  DeviceRecord,
  ExperimentalFeaturesModel,
  ListParams,
  ListResponse,
  Membership,
  Pusher,
  PusherRecord,
  RateLimitsModel,
  User,
  UserMedia,
  UserMediaRecord,
  UserRecord,
  UsernameAvailabilityResult,
  Whois,
} from "@/types/api";
import { returnMXID } from "@/utils/mxid";

// Transform API user to UserRecord
function mapUser(user: User): UserRecord {
  return {
    ...user,
    id: returnMXID(user.name),
    avatar_src: user.avatar_url || undefined,
    is_guest: user.is_guest ? 1 : 0,
    admin: user.admin ? 1 : 0,
    deactivated: user.deactivated ? 1 : 0,
    creation_ts_ms: user.creation_ts * 1000,
  };
}

// Get list of users
export async function getUsers(params: ListParams): Promise<ListResponse<UserRecord>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const { user_id, name, guests, deactivated, locked, suspended, search_term } = (params.filter || {}) as {
    user_id?: string;
    name?: string;
    guests?: boolean;
    deactivated?: boolean;
    locked?: boolean;
    suspended?: boolean;
    search_term?: string;
  };

  const url = buildUrl("/_synapse/admin/v2/users", {
    from,
    limit: perPage,
    user_id,
    search_term,
    name,
    guests,
    deactivated,
    locked,
    suspended,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ users: User[]; total: number }>(url);

  return {
    data: response.users.map(mapUser),
    total: response.total,
  };
}

// Get single user
export async function getUser(id: string): Promise<UserRecord> {
  const url = buildUrl(`/_synapse/admin/v2/users/${encodeURIComponent(id)}`);
  const user = await apiClient<User>(url);
  return mapUser(user);
}

// Create user
export async function createUser(
  data: Partial<User> & { id: string; password?: string }
): Promise<UserRecord> {
  const userId = returnMXID(data.id);
  const url = buildUrl(`/_synapse/admin/v2/users/${encodeURIComponent(userId)}`);

  const user = await apiClient<User>(url, {
    method: "PUT",
    body: JSON.stringify(data, filterNullValues),
  });

  return mapUser(user);
}

// Update user
export async function updateUser(
  id: string,
  data: Partial<User> & { password?: string; avatar_url?: string }
): Promise<UserRecord> {
  const url = buildUrl(`/_synapse/admin/v2/users/${encodeURIComponent(id)}`);

  const user = await apiClient<User>(url, {
    method: "PUT",
    body: JSON.stringify(data, filterNullValues),
  });

  return mapUser(user);
}

// Deactivate/delete user
export async function deactivateUser(id: string, erase: boolean = true): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/deactivate/${encodeURIComponent(returnMXID(id))}`);

  await apiClient(url, {
    method: "POST",
    body: JSON.stringify({ erase }),
  });
}

// Suspend user
export async function suspendUser(
  id: string,
  suspended: boolean
): Promise<{ success: boolean; error?: string; errcode?: string }> {
  const url = buildUrl(`/_synapse/admin/v1/suspend/${encodeURIComponent(returnMXID(id))}`);

  try {
    await apiClient(url, {
      method: "PUT",
      body: JSON.stringify({ suspend: suspended }),
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && "body" in error) {
      const body = (error as { body: { error?: string; errcode?: string } }).body;
      return { success: false, error: body?.error, errcode: body?.errcode };
    }
    throw error;
  }
}

// Erase user (deactivate + GDPR erase)
export async function eraseUser(id: string): Promise<{ success: boolean; error?: string; errcode?: string }> {
  const url = buildUrl(`/_synapse/admin/v1/deactivate/${encodeURIComponent(returnMXID(id))}`);

  try {
    await apiClient(url, {
      method: "POST",
      body: JSON.stringify({ erase: true }),
    });
    return { success: true };
  } catch (error) {
    if (error instanceof Error && "body" in error) {
      const body = (error as { body: { error?: string; errcode?: string } }).body;
      return { success: false, error: body?.error, errcode: body?.errcode };
    }
    throw error;
  }
}

// Check username availability
export async function checkUsernameAvailability(username: string): Promise<UsernameAvailabilityResult> {
  const url = buildUrl("/_synapse/admin/v1/username_available", { username });

  try {
    const result = await apiClient<UsernameAvailabilityResult>(url);
    return result;
  } catch (error) {
    if (error instanceof Error && "body" in error) {
      const body = (error as { body: { error?: string; errcode?: string } }).body;
      return { available: false, error: body?.error, errcode: body?.errcode };
    }
    throw error;
  }
}

// Get user devices
export async function getUserDevices(userId: string, params: ListParams): Promise<ListResponse<DeviceRecord>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v2/users/${encodeURIComponent(userId)}/devices`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ devices: Device[]; total: number }>(url);

  return {
    data: response.devices.map(d => ({ ...d, id: d.device_id })),
    total: response.total,
  };
}

// Delete user device
export async function deleteUserDevice(userId: string, deviceId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v2/users/${encodeURIComponent(userId)}/devices/${deviceId}`);
  await apiClient(url, { method: "DELETE" });
}

// Get user connections (whois)
export async function getUserConnections(userId: string): Promise<Whois> {
  const url = buildUrl(`/_synapse/admin/v1/whois/${encodeURIComponent(userId)}`);
  return apiClient<Whois>(url);
}

// Get user pushers
export async function getUserPushers(userId: string, params: ListParams): Promise<ListResponse<PusherRecord>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(userId)}/pushers`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ pushers: Pusher[]; total: number }>(url);

  return {
    data: response.pushers.map(p => ({ ...p, id: p.pushkey })),
    total: response.total,
  };
}

// Get user joined rooms
export async function getUserJoinedRooms(
  userId: string,
  params: ListParams
): Promise<ListResponse<{ id: string }>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(userId)}/joined_rooms`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ joined_rooms: string[]; total: number }>(url);

  return {
    data: response.joined_rooms.map(id => ({ id })),
    total: response.total,
  };
}

// Get user memberships
export async function getUserMemberships(
  userId: string,
  params: ListParams
): Promise<ListResponse<Membership>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(userId)}/memberships`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ memberships: Record<string, string>; total: number }>(url);

  const memberships = Object.entries(response.memberships).map(([roomId, membership]) => ({
    id: roomId,
    membership: membership as string,
  }));

  return {
    data: memberships,
    total: response.total,
  };
}

// Get user media
export async function getUserMedia(
  userId: string,
  params: ListParams
): Promise<ListResponse<UserMediaRecord>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(returnMXID(userId))}/media`, {
    from,
    limit: perPage,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ media: UserMedia[]; total: number }>(url);

  return {
    data: response.media.map(m => ({ ...m, id: m.media_id })),
    total: response.total,
  };
}

// Delete user media
export async function deleteUserMedia(mediaId: string): Promise<void> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/${homeServer}/${mediaId}`);
  await apiClient(url, { method: "DELETE" });
}

// Delete all user media
export async function deleteAllUserMedia(userId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(returnMXID(userId))}/media`);
  await apiClient(url, { method: "DELETE" });
}

// Redact all user events
export async function redactUserEvents(userId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/user/${encodeURIComponent(returnMXID(userId))}/redact`);
  await apiClient(url, {
    method: "POST",
    body: JSON.stringify({ rooms: [] }),
  });
}

// Get user experimental features
export async function getUserFeatures(userId: string): Promise<ExperimentalFeaturesModel> {
  const url = buildUrl(`/_synapse/admin/v1/experimental_features/${encodeURIComponent(returnMXID(userId))}`);
  const response = await apiClient<{ features: Record<string, boolean> }>(url);
  return { features: response.features };
}

// Update user experimental features
export async function updateUserFeatures(userId: string, features: ExperimentalFeaturesModel): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/experimental_features/${encodeURIComponent(returnMXID(userId))}`);
  await apiClient(url, {
    method: "PUT",
    body: JSON.stringify({ features: features.features }),
  });
}

// Get user rate limits
export async function getUserRateLimits(userId: string): Promise<RateLimitsModel> {
  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(returnMXID(userId))}/override_ratelimit`);
  return apiClient<RateLimitsModel>(url);
}

// Set user rate limits
export async function setUserRateLimits(userId: string, rateLimits: RateLimitsModel): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(returnMXID(userId))}/override_ratelimit`);

  const filtered = Object.entries(rateLimits)
    .filter(([, value]) => value !== null && value !== undefined)
    .reduce(
      (obj, [key, value]) => {
        obj[key] = value;
        return obj;
      },
      {} as Record<string, unknown>
    );

  if (Object.keys(filtered).length === 0) {
    await apiClient(url, { method: "DELETE" });
    return;
  }

  await apiClient(url, {
    method: "POST",
    body: JSON.stringify(filtered),
  });
}

// Get user account data
export async function getUserAccountData(userId: string): Promise<AccountDataModel> {
  const url = buildUrl(`/_synapse/admin/v1/users/${encodeURIComponent(returnMXID(userId))}/accountdata`);
  return apiClient<AccountDataModel>(url);
}

// Send server notice to user
export async function sendServerNotice(userId: string, body: string): Promise<{ event_id: string }> {
  const url = buildUrl("/_synapse/admin/v1/send_server_notice");

  return apiClient<{ event_id: string }>(url, {
    method: "POST",
    body: JSON.stringify({
      user_id: returnMXID(userId),
      content: {
        msgtype: "m.text",
        body,
      },
    }),
  });
}

// Upload media (for avatar, etc.)
export async function uploadMedia(
  file: File,
  filename: string,
  contentType: string
): Promise<{ content_uri: string }> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/_matrix/media/v3/upload?filename=${encodeURIComponent(filename)}`;

  const token = localStorage.getItem("access_token");
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Content-Type", contentType);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

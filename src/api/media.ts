import { apiClient, buildUrl, getBaseUrl, getSearchOrder } from "./client";

import type {
  DeleteMediaParams,
  DeleteMediaResult,
  ListParams,
  ListResponse,
  UserMediaStatistic,
  UserMediaStatisticRecord,
} from "@/types/api";

// Get user media statistics
export async function getUserMediaStatistics(params: ListParams): Promise<ListResponse<UserMediaStatisticRecord>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const { search_term } = (params.filter || {}) as { search_term?: string };

  const url = buildUrl("/_synapse/admin/v1/statistics/users/media", {
    from,
    limit: perPage,
    search_term,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ users: UserMediaStatistic[]; total: number }>(url);

  return {
    data: response.users.map(u => ({ ...u, id: u.user_id })),
    total: response.total,
  };
}

// Delete local media by date/size
export async function deleteLocalMedia(params: DeleteMediaParams): Promise<DeleteMediaResult> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/${homeServer}/delete`, {
    before_ts: params.before_ts,
    size_gt: params.size_gt,
    keep_profiles: params.keep_profiles,
  });

  return apiClient<DeleteMediaResult>(url, { method: "POST" });
}

// Purge remote media
export async function purgeRemoteMedia(beforeTs: string): Promise<DeleteMediaResult> {
  const url = buildUrl("/_synapse/admin/v1/purge_media_cache", {
    before_ts: beforeTs,
  });

  return apiClient<DeleteMediaResult>(url, { method: "POST" });
}

// Protect media from quarantine
export async function protectMedia(mediaId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/media/protect/${mediaId}`);
  await apiClient(url, { method: "POST" });
}

// Unprotect media
export async function unprotectMedia(mediaId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/media/unprotect/${mediaId}`);
  await apiClient(url, { method: "POST" });
}

// Quarantine media
export async function quarantineMedia(mediaId: string): Promise<void> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/quarantine/${homeServer}/${mediaId}`);
  await apiClient(url, { method: "POST" });
}

// Unquarantine media
export async function unquarantineMedia(mediaId: string): Promise<void> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/unquarantine/${homeServer}/${mediaId}`);
  await apiClient(url, { method: "POST" });
}

// Delete media by ID
export async function deleteMedia(mediaId: string): Promise<void> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/${homeServer}/${mediaId}`);
  await apiClient(url, { method: "DELETE" });
}

// Get media URL for display
export function getMediaUrl(mxcUrl: string, type: "download" | "thumbnail" = "download"): string {
  const baseUrl = getBaseUrl();
  const homeServer = localStorage.getItem("home_server");

  // Parse mxc:// URL
  const match = mxcUrl.match(/^mxc:\/\/([^/]+)\/(.+)$/);
  if (!match) {
    return "";
  }

  const [, serverName, mediaId] = match;

  if (type === "thumbnail") {
    return `${baseUrl}/_matrix/client/v1/media/thumbnail/${serverName}/${mediaId}?width=96&height=96&method=crop`;
  }

  return `${baseUrl}/_matrix/client/v1/media/download/${serverName}/${mediaId}`;
}

// Fetch authenticated media (returns blob)
export async function fetchAuthenticatedMedia(
  mxcUrl: string,
  type: "download" | "thumbnail" = "download"
): Promise<Blob> {
  const url = getMediaUrl(mxcUrl, type);
  const token = localStorage.getItem("access_token");

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.statusText}`);
  }

  return response.blob();
}

import { apiClient, buildUrl, getSearchOrder } from "./client";

import type {
  ForwardExtremity,
  ListParams,
  ListResponse,
  Room,
  RoomRecord,
  RoomState,
  UserMedia,
  UserMediaRecord,
} from "@/types/api";

// Transform API room to RoomRecord
function mapRoom(room: Room): RoomRecord {
  return {
    ...room,
    id: room.room_id,
    alias: room.canonical_alias,
    members: room.joined_members,
    is_encrypted: !!room.encryption,
    federatable: !!room.federatable,
    public: !!room.public,
    avatar: room.avatar_url || undefined,
  };
}

// Get list of rooms
export async function getRooms(params: ListParams): Promise<ListResponse<RoomRecord>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const { search_term, public_rooms, empty_rooms } = (params.filter || {}) as {
    search_term?: string;
    public_rooms?: boolean;
    empty_rooms?: boolean;
  };

  const url = buildUrl("/_synapse/admin/v1/rooms", {
    from,
    limit: perPage,
    search_term,
    public_rooms,
    empty_rooms,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ rooms: Room[]; total_rooms: number }>(url);

  return {
    data: response.rooms.map(mapRoom),
    total: response.total_rooms,
  };
}

// Get single room
export async function getRoom(id: string): Promise<RoomRecord> {
  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(id)}`);
  const room = await apiClient<Room>(url);
  return mapRoom(room);
}

// Delete room
export async function deleteRoom(
  id: string,
  block: boolean = false
): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v2/rooms/${encodeURIComponent(id)}`);

  await apiClient(url, {
    method: "DELETE",
    body: JSON.stringify({ block }),
  });
}

// Delete multiple rooms
export async function deleteRooms(
  ids: string[],
  block: boolean = false
): Promise<void> {
  await Promise.all(ids.map(id => deleteRoom(id, block)));
}

// Get room members
export async function getRoomMembers(
  roomId: string,
  params: ListParams
): Promise<ListResponse<{ id: string }>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/members`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ members: string[]; total: number }>(url);

  return {
    data: response.members.map(id => ({ id })),
    total: response.total,
  };
}

// Get room media
export async function getRoomMedia(
  roomId: string,
  params: ListParams
): Promise<ListResponse<UserMediaRecord>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;
  const homeServer = localStorage.getItem("home_server");

  const url = buildUrl(`/_synapse/admin/v1/room/${encodeURIComponent(roomId)}/media`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ local: string[]; total: number }>(url);

  return {
    data: response.local.map(mediaId => ({
      id: mediaId.replace(`mxc://${homeServer}/`, ""),
      media_id: mediaId.replace(`mxc://${homeServer}/`, ""),
      created_ts: 0,
      media_length: 0,
      media_type: "",
      safe_from_quarantine: false,
    })),
    total: response.total,
  };
}

// Delete room media
export async function deleteRoomMedia(mediaId: string): Promise<void> {
  const homeServer = localStorage.getItem("home_server");
  const url = buildUrl(`/_synapse/admin/v1/media/${homeServer}/${mediaId}`);
  await apiClient(url, { method: "DELETE" });
}

// Get room state
export async function getRoomState(
  roomId: string,
  params: ListParams
): Promise<ListResponse<RoomState & { id: string }>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/state`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ state: RoomState[] }>(url);

  // Apply pagination manually since API doesn't support it
  const paginatedState = response.state.slice(from, from + perPage);

  return {
    data: paginatedState.map(s => ({ ...s, id: s.event_id })),
    total: response.state.length,
  };
}

// Get room forward extremities
export async function getRoomForwardExtremities(
  roomId: string,
  params: ListParams
): Promise<ListResponse<ForwardExtremity & { id: string }>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/forward_extremities`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ results: ForwardExtremity[]; count: number }>(url);

  return {
    data: response.results.map(fe => ({ ...fe, id: fe.event_id })),
    total: response.count,
  };
}

// Delete room forward extremities
export async function deleteRoomForwardExtremities(roomId: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/forward_extremities`);
  await apiClient(url, { method: "DELETE" });
}

// Make user room admin
export async function makeRoomAdmin(
  roomId: string,
  userId: string
): Promise<{ success: boolean; error?: string; errcode?: string }> {
  const url = buildUrl(`/_synapse/admin/v1/rooms/${encodeURIComponent(roomId)}/make_room_admin`);

  try {
    await apiClient(url, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
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

// Room directory operations
export async function getRoomDirectory(params: ListParams): Promise<ListResponse<RoomRecord>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl("/_matrix/client/r0/publicRooms", {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ chunk: Room[]; total_room_count_estimate: number }>(url);

  return {
    data: response.chunk.map(room => ({
      ...mapRoom(room),
      guest_access: room.guest_access ? "can_join" : "forbidden",
    })),
    total: response.total_room_count_estimate,
  };
}

// Publish room to directory
export async function publishRoomToDirectory(roomId: string): Promise<void> {
  const url = buildUrl(`/_matrix/client/r0/directory/list/room/${encodeURIComponent(roomId)}`);

  await apiClient(url, {
    method: "PUT",
    body: JSON.stringify({ visibility: "public" }),
  });
}

// Unpublish room from directory
export async function unpublishRoomFromDirectory(roomId: string): Promise<void> {
  const url = buildUrl(`/_matrix/client/r0/directory/list/room/${encodeURIComponent(roomId)}`);

  await apiClient(url, {
    method: "PUT",
    body: JSON.stringify({ visibility: "private" }),
  });
}

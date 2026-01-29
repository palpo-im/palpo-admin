import { apiClient, buildUrl, getSearchOrder } from "./client";

import type {
  Destination,
  DestinationRecord,
  DestinationRoom,
  DestinationRoomRecord,
  ListParams,
  ListResponse,
} from "@/types/api";

// Get list of federation destinations
export async function getDestinations(params: ListParams): Promise<ListResponse<DestinationRecord>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const { destination } = (params.filter || {}) as { destination?: string };

  const url = buildUrl("/_synapse/admin/v1/federation/destinations", {
    from,
    limit: perPage,
    destination,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ destinations: Destination[]; total: number }>(url);

  return {
    data: response.destinations.map(d => ({ ...d, id: d.destination })),
    total: response.total,
  };
}

// Get single destination
export async function getDestination(id: string): Promise<DestinationRecord> {
  const url = buildUrl(`/_synapse/admin/v1/federation/destinations/${encodeURIComponent(id)}`);
  const destination = await apiClient<Destination>(url);
  return { ...destination, id: destination.destination };
}

// Reset destination connection
export async function resetDestinationConnection(id: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/federation/destinations/${encodeURIComponent(id)}/reset_connection`);
  await apiClient(url, { method: "POST" });
}

// Get destination rooms
export async function getDestinationRooms(
  destinationId: string,
  params: ListParams
): Promise<ListResponse<DestinationRoomRecord>> {
  const { page, perPage } = params.pagination;
  const from = (page - 1) * perPage;

  const url = buildUrl(`/_synapse/admin/v1/federation/destinations/${encodeURIComponent(destinationId)}/rooms`, {
    from,
    limit: perPage,
  });

  const response = await apiClient<{ rooms: DestinationRoom[]; total: number }>(url);

  return {
    data: response.rooms.map(r => ({ ...r, id: r.room_id })),
    total: response.total,
  };
}

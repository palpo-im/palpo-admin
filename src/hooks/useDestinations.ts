import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as destinationsApi from "@/api/destinations";
import type { DestinationRecord, DestinationRoomRecord, ListParams, ListResponse } from "@/types/api";

// Query keys
export const destinationKeys = {
  all: ["destinations"] as const,
  lists: () => [...destinationKeys.all, "list"] as const,
  list: (params: ListParams) => [...destinationKeys.lists(), params] as const,
  details: () => [...destinationKeys.all, "detail"] as const,
  detail: (id: string) => [...destinationKeys.details(), id] as const,
  rooms: (destinationId: string) => [...destinationKeys.detail(destinationId), "rooms"] as const,
};

// Get destinations list
export function useDestinations(params: ListParams) {
  return useQuery<ListResponse<DestinationRecord>>({
    queryKey: destinationKeys.list(params),
    queryFn: () => destinationsApi.getDestinations(params),
  });
}

// Get single destination
export function useDestination(id: string, enabled = true) {
  return useQuery<DestinationRecord>({
    queryKey: destinationKeys.detail(id),
    queryFn: () => destinationsApi.getDestination(id),
    enabled: enabled && !!id,
  });
}

// Reset destination connection
export function useResetDestinationConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => destinationsApi.resetDestinationConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: destinationKeys.all });
    },
  });
}

// Get destination rooms
export function useDestinationRooms(destinationId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<DestinationRoomRecord>>({
    queryKey: [...destinationKeys.rooms(destinationId), params],
    queryFn: () => destinationsApi.getDestinationRooms(destinationId, params),
    enabled: enabled && !!destinationId,
  });
}

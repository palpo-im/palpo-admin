import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as roomsApi from "@/api/rooms";
import type {
  ForwardExtremity,
  ListParams,
  ListResponse,
  RoomRecord,
  RoomState,
  UserMediaRecord,
} from "@/types/api";

// Query keys
export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: ListParams) => [...roomKeys.lists(), params] as const,
  details: () => [...roomKeys.all, "detail"] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
  members: (roomId: string) => [...roomKeys.detail(roomId), "members"] as const,
  media: (roomId: string) => [...roomKeys.detail(roomId), "media"] as const,
  state: (roomId: string) => [...roomKeys.detail(roomId), "state"] as const,
  forwardExtremities: (roomId: string) => [...roomKeys.detail(roomId), "forwardExtremities"] as const,
  directory: () => [...roomKeys.all, "directory"] as const,
};

// Get rooms list
export function useRooms(params: ListParams) {
  return useQuery<ListResponse<RoomRecord>>({
    queryKey: roomKeys.list(params),
    queryFn: () => roomsApi.getRooms(params),
  });
}

// Get single room
export function useRoom(id: string, enabled = true) {
  return useQuery<RoomRecord>({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsApi.getRoom(id),
    enabled: enabled && !!id,
  });
}

// Delete room mutation
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, block }: { id: string; block?: boolean }) => roomsApi.deleteRoom(id, block),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

// Delete multiple rooms mutation
export function useDeleteRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, block }: { ids: string[]; block?: boolean }) => roomsApi.deleteRooms(ids, block),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

// Room members
export function useRoomMembers(roomId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<{ id: string }>>({
    queryKey: [...roomKeys.members(roomId), params],
    queryFn: () => roomsApi.getRoomMembers(roomId, params),
    enabled: enabled && !!roomId,
  });
}

// Room media
export function useRoomMedia(roomId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<UserMediaRecord>>({
    queryKey: [...roomKeys.media(roomId), params],
    queryFn: () => roomsApi.getRoomMedia(roomId, params),
    enabled: enabled && !!roomId,
  });
}

export function useDeleteRoomMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => roomsApi.deleteRoomMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

// Room state
export function useRoomState(roomId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<RoomState & { id: string }>>({
    queryKey: [...roomKeys.state(roomId), params],
    queryFn: () => roomsApi.getRoomState(roomId, params),
    enabled: enabled && !!roomId,
  });
}

// Room forward extremities
export function useRoomForwardExtremities(roomId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<ForwardExtremity & { id: string }>>({
    queryKey: [...roomKeys.forwardExtremities(roomId), params],
    queryFn: () => roomsApi.getRoomForwardExtremities(roomId, params),
    enabled: enabled && !!roomId,
  });
}

export function useDeleteRoomForwardExtremities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsApi.deleteRoomForwardExtremities(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.forwardExtremities(roomId) });
    },
  });
}

// Make room admin
export function useMakeRoomAdmin() {
  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) => roomsApi.makeRoomAdmin(roomId, userId),
  });
}

// Room directory
export function useRoomDirectory(params: ListParams) {
  return useQuery<ListResponse<RoomRecord>>({
    queryKey: [...roomKeys.directory(), params],
    queryFn: () => roomsApi.getRoomDirectory(params),
  });
}

export function usePublishRoomToDirectory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsApi.publishRoomToDirectory(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.directory() });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useUnpublishRoomFromDirectory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsApi.unpublishRoomFromDirectory(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.directory() });
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

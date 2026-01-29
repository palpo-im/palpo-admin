import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as mediaApi from "@/api/media";
import type { DeleteMediaParams, DeleteMediaResult, ListParams, ListResponse, UserMediaStatisticRecord } from "@/types/api";

// Default params for list queries
const defaultListParams: ListParams = {
  pagination: { page: 1, perPage: 1000 },
  sort: { field: "media_length", order: "desc" },
};

// Query keys
export const mediaKeys = {
  all: ["media"] as const,
  statistics: () => [...mediaKeys.all, "statistics"] as const,
  statisticsList: (params: Partial<ListParams>) => [...mediaKeys.statistics(), params] as const,
};

// Get user media statistics
export function useUserMediaStatistics(params?: Partial<ListParams>) {
  const fullParams: ListParams = { ...defaultListParams, ...params };
  return useQuery<ListResponse<UserMediaStatisticRecord>>({
    queryKey: mediaKeys.statisticsList(fullParams),
    queryFn: () => mediaApi.getUserMediaStatistics(fullParams),
  });
}

// Alias for useUserMediaStatistics
export function useMediaStatistics() {
  return useQuery<{ media_count: number; media_length: number; users: UserMediaStatisticRecord[] }>({
    queryKey: mediaKeys.statistics(),
    queryFn: async () => {
      const result = await mediaApi.getUserMediaStatistics(defaultListParams);
      return {
        media_count: result.data?.reduce((acc, u) => acc + (u.media_count || 0), 0) || 0,
        media_length: result.data?.reduce((acc, u) => acc + (u.media_length || 0), 0) || 0,
        users: result.data || [],
      };
    },
  });
}

// Delete local media
export function useDeleteLocalMedia() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMediaResult, Error, DeleteMediaParams>({
    mutationFn: mediaApi.deleteLocalMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Purge remote media
export function usePurgeRemoteMedia() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMediaResult, Error, string>({
    mutationFn: mediaApi.purgeRemoteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Protect media
export function useProtectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mediaId }: { mediaId: string }) => mediaApi.protectMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Unprotect media
export function useUnprotectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => mediaApi.unprotectMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Quarantine media
export function useQuarantineMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serverName, mediaId }: { serverName: string; mediaId: string }) =>
      mediaApi.quarantineMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Unquarantine media
export function useUnquarantineMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => mediaApi.unquarantineMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Delete media
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serverName, mediaId }: { serverName: string; mediaId: string }) =>
      mediaApi.deleteMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.all });
    },
  });
}

// Helper exports for media URLs
export const getMediaUrl = mediaApi.getMediaUrl;
export const fetchAuthenticatedMedia = mediaApi.fetchAuthenticatedMedia;

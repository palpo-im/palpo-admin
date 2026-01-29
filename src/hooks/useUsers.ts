import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as usersApi from "@/api/users";
import type {
  AccountDataModel,
  DeviceRecord,
  ExperimentalFeaturesModel,
  ListParams,
  ListResponse,
  Membership,
  PusherRecord,
  RateLimitsModel,
  UserMediaRecord,
  UserRecord,
  UsernameAvailabilityResult,
  Whois,
} from "@/types/api";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: ListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  devices: (userId: string) => [...userKeys.detail(userId), "devices"] as const,
  connections: (userId: string) => [...userKeys.detail(userId), "connections"] as const,
  pushers: (userId: string) => [...userKeys.detail(userId), "pushers"] as const,
  joinedRooms: (userId: string) => [...userKeys.detail(userId), "joinedRooms"] as const,
  memberships: (userId: string) => [...userKeys.detail(userId), "memberships"] as const,
  media: (userId: string) => [...userKeys.detail(userId), "media"] as const,
  features: (userId: string) => [...userKeys.detail(userId), "features"] as const,
  rateLimits: (userId: string) => [...userKeys.detail(userId), "rateLimits"] as const,
  accountData: (userId: string) => [...userKeys.detail(userId), "accountData"] as const,
};

// Get users list
export function useUsers(params: ListParams) {
  return useQuery<ListResponse<UserRecord>>({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
  });
}

// Get single user
export function useUser(id: string, enabled = true) {
  return useQuery<UserRecord>({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: enabled && !!id,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof usersApi.createUser>[0]) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof usersApi.updateUser>[1] }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// Deactivate user mutation
export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, deactivate }: { userId: string; deactivate: boolean }) =>
      usersApi.deactivateUser(userId, deactivate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Delete user mutation (alias for erase)
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.eraseUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Suspend user mutation
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) => usersApi.suspendUser(id, suspended),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

// Erase user mutation
export function useEraseUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.eraseUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Check username availability
export function useCheckUsernameAvailability() {
  return useMutation<UsernameAvailabilityResult, Error, string>({
    mutationFn: usersApi.checkUsernameAvailability,
  });
}

// Default params for list queries
const defaultListParams: ListParams = {
  pagination: { page: 1, perPage: 100 },
  sort: { field: "last_seen_ts", order: "desc" },
};

// User devices
export function useUserDevices(userId: string, params?: Partial<ListParams>, enabled = true) {
  const fullParams: ListParams = { ...defaultListParams, ...params };
  return useQuery<ListResponse<DeviceRecord>>({
    queryKey: [...userKeys.devices(userId), fullParams],
    queryFn: () => usersApi.getUserDevices(userId, fullParams),
    enabled: enabled && !!userId,
  });
}

export function useDeleteUserDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, deviceId }: { userId: string; deviceId: string }) =>
      usersApi.deleteUserDevice(userId, deviceId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.devices(userId) });
    },
  });
}

// User connections
export function useUserConnections(userId: string, enabled = true) {
  return useQuery<Whois>({
    queryKey: userKeys.connections(userId),
    queryFn: () => usersApi.getUserConnections(userId),
    enabled: enabled && !!userId,
  });
}

// User pushers
export function useUserPushers(userId: string, params?: Partial<ListParams>, enabled = true) {
  const fullParams: ListParams = { ...defaultListParams, ...params };
  return useQuery<ListResponse<PusherRecord>>({
    queryKey: [...userKeys.pushers(userId), fullParams],
    queryFn: () => usersApi.getUserPushers(userId, fullParams),
    enabled: enabled && !!userId,
  });
}

// User joined rooms
export function useUserJoinedRooms(userId: string, params?: Partial<ListParams>, enabled = true) {
  const fullParams: ListParams = { ...defaultListParams, ...params };
  return useQuery<ListResponse<{ id: string }>>({
    queryKey: [...userKeys.joinedRooms(userId), fullParams],
    queryFn: () => usersApi.getUserJoinedRooms(userId, fullParams),
    enabled: enabled && !!userId,
  });
}

// Alias for useUserJoinedRooms
export function useUserRooms(userId: string, enabled = true) {
  return useUserJoinedRooms(userId, undefined, enabled);
}

// User memberships
export function useUserMemberships(userId: string, params: ListParams, enabled = true) {
  return useQuery<ListResponse<Membership>>({
    queryKey: [...userKeys.memberships(userId), params],
    queryFn: () => usersApi.getUserMemberships(userId, params),
    enabled: enabled && !!userId,
  });
}

// User media
export function useUserMedia(userId: string, params?: Partial<ListParams>, enabled = true) {
  const fullParams: ListParams = { ...defaultListParams, ...params };
  return useQuery<ListResponse<UserMediaRecord>>({
    queryKey: [...userKeys.media(userId), fullParams],
    queryFn: () => usersApi.getUserMedia(userId, fullParams),
    enabled: enabled && !!userId,
  });
}

export function useDeleteUserMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaId: string) => usersApi.deleteUserMedia(mediaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useDeleteAllUserMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.deleteAllUserMedia(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.media(userId) });
    },
  });
}

// Redact user events
export function useRedactUserEvents() {
  return useMutation({
    mutationFn: (userId: string) => usersApi.redactUserEvents(userId),
  });
}

// User experimental features
export function useUserFeatures(userId: string, enabled = true) {
  return useQuery<ExperimentalFeaturesModel>({
    queryKey: userKeys.features(userId),
    queryFn: () => usersApi.getUserFeatures(userId),
    enabled: enabled && !!userId,
  });
}

export function useUpdateUserFeatures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, features }: { userId: string; features: ExperimentalFeaturesModel }) =>
      usersApi.updateUserFeatures(userId, features),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.features(userId) });
    },
  });
}

// User rate limits
export function useUserRateLimits(userId: string, enabled = true) {
  return useQuery<RateLimitsModel>({
    queryKey: userKeys.rateLimits(userId),
    queryFn: () => usersApi.getUserRateLimits(userId),
    enabled: enabled && !!userId,
  });
}

export function useSetUserRateLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, rateLimits }: { userId: string; rateLimits: RateLimitsModel }) =>
      usersApi.setUserRateLimits(userId, rateLimits),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.rateLimits(userId) });
    },
  });
}

// User account data
export function useUserAccountData(userId: string, enabled = true) {
  return useQuery<AccountDataModel>({
    queryKey: userKeys.accountData(userId),
    queryFn: () => usersApi.getUserAccountData(userId),
    enabled: enabled && !!userId,
  });
}

// Send server notice
export function useSendServerNotice() {
  return useMutation({
    mutationFn: ({ userId, body }: { userId: string; body: string }) => usersApi.sendServerNotice(userId, body),
  });
}

// Upload media
export function useUploadMedia() {
  return useMutation({
    mutationFn: ({ file, filename, contentType }: { file: File; filename: string; contentType: string }) =>
      usersApi.uploadMedia(file, filename, contentType),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as registrationTokensApi from "@/api/registration-tokens";
import type { ListParams, ListResponse, RegistrationTokenRecord } from "@/types/api";

// Query keys
export const registrationTokenKeys = {
  all: ["registrationTokens"] as const,
  lists: () => [...registrationTokenKeys.all, "list"] as const,
  list: (params: ListParams) => [...registrationTokenKeys.lists(), params] as const,
  details: () => [...registrationTokenKeys.all, "detail"] as const,
  detail: (token: string) => [...registrationTokenKeys.details(), token] as const,
};

// Get registration tokens list
export function useRegistrationTokens(params: ListParams) {
  return useQuery<ListResponse<RegistrationTokenRecord>>({
    queryKey: registrationTokenKeys.list(params),
    queryFn: () => registrationTokensApi.getRegistrationTokens(params),
  });
}

// Get single registration token
export function useRegistrationToken(token: string, enabled = true) {
  return useQuery<RegistrationTokenRecord>({
    queryKey: registrationTokenKeys.detail(token),
    queryFn: () => registrationTokensApi.getRegistrationToken(token),
    enabled: enabled && !!token,
  });
}

// Create registration token
export function useCreateRegistrationToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: registrationTokensApi.CreateRegistrationTokenParams) =>
      registrationTokensApi.createRegistrationToken(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationTokenKeys.lists() });
    },
  });
}

// Update registration token
export function useUpdateRegistrationToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, params }: { token: string; params: registrationTokensApi.UpdateRegistrationTokenParams }) =>
      registrationTokensApi.updateRegistrationToken(token, params),
    onSuccess: (_, { token }) => {
      queryClient.invalidateQueries({ queryKey: registrationTokenKeys.detail(token) });
      queryClient.invalidateQueries({ queryKey: registrationTokenKeys.lists() });
    },
  });
}

// Delete registration token
export function useDeleteRegistrationToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => registrationTokensApi.deleteRegistrationToken(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationTokenKeys.all });
    },
  });
}

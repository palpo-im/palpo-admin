import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as palpoApi from "@/api/palpo-admin";
import type {
  ServerStatusResponse,
  ServerProcessResponse,
  ServerNotification,
  PaymentsResponse,
} from "@/types/api";

// Query keys
export const palpoKeys = {
  all: ["palpo"] as const,
  status: () => [...palpoKeys.all, "status"] as const,
  process: () => [...palpoKeys.all, "process"] as const,
  notifications: () => [...palpoKeys.all, "notifications"] as const,
  payments: () => [...palpoKeys.all, "payments"] as const,
};

// Check if Palpo admin is enabled
export function usePalpoAdminEnabled(): boolean {
  return palpoApi.isPalpoAdminEnabled();
}

// Server status
export function useServerStatus() {
  return useQuery<ServerStatusResponse>({
    queryKey: palpoKeys.status(),
    queryFn: palpoApi.getServerStatus,
    enabled: palpoApi.isPalpoAdminEnabled(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Trigger status check
export function useTriggerCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: palpoApi.triggerStatusCheck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: palpoKeys.status() });
    },
  });
}

// Server process
export function useServerProcess() {
  return useQuery<ServerProcessResponse | null>({
    queryKey: palpoKeys.process(),
    queryFn: palpoApi.getServerProcess,
    enabled: palpoApi.isPalpoAdminEnabled(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

// Run server command
export function useRunServerCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: palpoApi.runServerCommand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: palpoKeys.process() });
    },
  });
}

// Server notifications
export function useServerNotifications() {
  return useQuery<ServerNotification[]>({
    queryKey: palpoKeys.notifications(),
    queryFn: palpoApi.getServerNotifications,
    enabled: palpoApi.isPalpoAdminEnabled(),
  });
}

// Dismiss notification
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: palpoApi.dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: palpoKeys.notifications() });
    },
  });
}

// Payments
export function usePayments() {
  return useQuery<PaymentsResponse>({
    queryKey: palpoKeys.payments(),
    queryFn: palpoApi.getPayments,
    enabled: palpoApi.isPalpoAdminEnabled(),
  });
}

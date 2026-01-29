import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as serverInfoApi from "@/api/server-info";
import type {
  PaymentsResponse,
  RecurringCommand,
  ScheduledCommand,
  ServerCommandsResponse,
  ServerNotificationsResponse,
  ServerProcessResponse,
  ServerStatusResponse,
} from "@/types/api";

// Query keys
export const serverInfoKeys = {
  all: ["serverInfo"] as const,
  version: () => [...serverInfoKeys.all, "version"] as const,
  features: () => [...serverInfoKeys.all, "features"] as const,
  status: (url: string) => [...serverInfoKeys.all, "status", url] as const,
  process: (url: string) => [...serverInfoKeys.all, "process", url] as const,
  notifications: (url: string) => [...serverInfoKeys.all, "notifications", url] as const,
  commands: (url: string) => [...serverInfoKeys.all, "commands", url] as const,
  scheduledCommands: (url: string) => [...serverInfoKeys.all, "scheduledCommands", url] as const,
  recurringCommands: (url: string) => [...serverInfoKeys.all, "recurringCommands", url] as const,
  payments: (url: string) => [...serverInfoKeys.all, "payments", url] as const,
};

// Get server version
export function useServerVersion() {
  return useQuery<string | null>({
    queryKey: serverInfoKeys.version(),
    queryFn: serverInfoApi.getServerVersion,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get supported features
export function useSupportedFeatures() {
  return useQuery<{ versions: string[]; unstable_features: Record<string, boolean> } | null>({
    queryKey: serverInfoKeys.features(),
    queryFn: serverInfoApi.getSupportedFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Palpo specific hooks

// Server status
export function useServerStatus(palpoAdminUrl: string, enabled = true) {
  return useQuery<ServerStatusResponse>({
    queryKey: serverInfoKeys.status(palpoAdminUrl),
    queryFn: () => serverInfoApi.getServerStatus(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Server running process
export function useServerRunningProcess(palpoAdminUrl: string, enabled = true) {
  return useQuery<ServerProcessResponse>({
    queryKey: serverInfoKeys.process(palpoAdminUrl),
    queryFn: () => serverInfoApi.getServerRunningProcess(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
}

// Server notifications
export function useServerNotifications(palpoAdminUrl: string, enabled = true) {
  return useQuery<ServerNotificationsResponse>({
    queryKey: serverInfoKeys.notifications(palpoAdminUrl),
    queryFn: () => serverInfoApi.getServerNotifications(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
  });
}

export function useDeleteServerNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (palpoAdminUrl: string) => serverInfoApi.deleteServerNotifications(palpoAdminUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.all });
    },
  });
}

// Server commands
export function useServerCommands(palpoAdminUrl: string, enabled = true) {
  return useQuery<{ maintenance: boolean; commands: ServerCommandsResponse[] }>({
    queryKey: serverInfoKeys.commands(palpoAdminUrl),
    queryFn: () => serverInfoApi.getServerCommands(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
  });
}

export function useRunServerCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      palpoAdminUrl,
      command,
      additionalArgs,
    }: {
      palpoAdminUrl: string;
      command: string;
      additionalArgs?: Record<string, unknown>;
    }) => serverInfoApi.runServerCommand(palpoAdminUrl, command, additionalArgs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.all });
    },
  });
}

// Scheduled commands
export function useScheduledCommands(palpoAdminUrl: string, enabled = true) {
  return useQuery<ScheduledCommand[]>({
    queryKey: serverInfoKeys.scheduledCommands(palpoAdminUrl),
    queryFn: () => serverInfoApi.getScheduledCommands(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
  });
}

export function useCreateScheduledCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, command }: { palpoAdminUrl: string; command: Partial<ScheduledCommand> }) =>
      serverInfoApi.createScheduledCommand(palpoAdminUrl, command),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.scheduledCommands(palpoAdminUrl) });
    },
  });
}

export function useUpdateScheduledCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, command }: { palpoAdminUrl: string; command: ScheduledCommand }) =>
      serverInfoApi.updateScheduledCommand(palpoAdminUrl, command),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.scheduledCommands(palpoAdminUrl) });
    },
  });
}

export function useDeleteScheduledCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, id }: { palpoAdminUrl: string; id: string }) =>
      serverInfoApi.deleteScheduledCommand(palpoAdminUrl, id),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.scheduledCommands(palpoAdminUrl) });
    },
  });
}

// Recurring commands
export function useRecurringCommands(palpoAdminUrl: string, enabled = true) {
  return useQuery<RecurringCommand[]>({
    queryKey: serverInfoKeys.recurringCommands(palpoAdminUrl),
    queryFn: () => serverInfoApi.getRecurringCommands(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
  });
}

export function useCreateRecurringCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, command }: { palpoAdminUrl: string; command: Partial<RecurringCommand> }) =>
      serverInfoApi.createRecurringCommand(palpoAdminUrl, command),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.recurringCommands(palpoAdminUrl) });
    },
  });
}

export function useUpdateRecurringCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, command }: { palpoAdminUrl: string; command: RecurringCommand }) =>
      serverInfoApi.updateRecurringCommand(palpoAdminUrl, command),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.recurringCommands(palpoAdminUrl) });
    },
  });
}

export function useDeleteRecurringCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ palpoAdminUrl, id }: { palpoAdminUrl: string; id: string }) =>
      serverInfoApi.deleteRecurringCommand(palpoAdminUrl, id),
    onSuccess: (_, { palpoAdminUrl }) => {
      queryClient.invalidateQueries({ queryKey: serverInfoKeys.recurringCommands(palpoAdminUrl) });
    },
  });
}

// Payments
export function usePayments(palpoAdminUrl: string, enabled = true) {
  return useQuery<PaymentsResponse>({
    queryKey: serverInfoKeys.payments(palpoAdminUrl),
    queryFn: () => serverInfoApi.getPayments(palpoAdminUrl),
    enabled: enabled && !!palpoAdminUrl,
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: ({ palpoAdminUrl, transactionId }: { palpoAdminUrl: string; transactionId: string }) =>
      serverInfoApi.downloadInvoice(palpoAdminUrl, transactionId),
  });
}

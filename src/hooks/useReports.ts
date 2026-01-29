import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as reportsApi from "@/api/reports";
import type { EventReport, ListParams, ListResponse } from "@/types/api";

// Query keys
export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (params: ListParams) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (id: number) => [...reportKeys.details(), id] as const,
};

// Get reports list
export function useReports(params: ListParams) {
  return useQuery<ListResponse<EventReport>>({
    queryKey: reportKeys.list(params),
    queryFn: () => reportsApi.getReports(params),
  });
}

// Get single report
export function useReport(id: number, enabled = true) {
  return useQuery<EventReport>({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.getReport(id),
    enabled: enabled && !!id,
  });
}

// Delete report mutation
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

// Delete multiple reports mutation
export function useDeleteReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => reportsApi.deleteReports(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

import { apiClient, buildUrl, getSearchOrder } from "./client";

import type { EventReport, ListParams, ListResponse } from "@/types/api";

// Get list of event reports
export async function getReports(params: ListParams): Promise<ListResponse<EventReport>> {
  const { page, perPage } = params.pagination;
  const { field, order } = params.sort;
  const from = (page - 1) * perPage;

  const { room_id, user_id } = (params.filter || {}) as {
    room_id?: string;
    user_id?: string;
  };

  const url = buildUrl("/_synapse/admin/v1/event_reports", {
    from,
    limit: perPage,
    room_id,
    user_id,
    order_by: field,
    dir: getSearchOrder(order),
  });

  const response = await apiClient<{ event_reports: EventReport[]; total: number }>(url);

  return {
    data: response.event_reports,
    total: response.total,
  };
}

// Get single report
export async function getReport(id: number): Promise<EventReport> {
  const url = buildUrl(`/_synapse/admin/v1/event_reports/${id}`);
  return apiClient<EventReport>(url);
}

// Delete report
export async function deleteReport(id: number): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/event_reports/${id}`);
  await apiClient(url, { method: "DELETE" });
}

// Delete multiple reports
export async function deleteReports(ids: number[]): Promise<void> {
  await Promise.all(ids.map(id => deleteReport(id)));
}

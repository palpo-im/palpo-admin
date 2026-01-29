import { apiClient, buildUrl } from "./client";

import type { ListParams, ListResponse, RegistrationToken, RegistrationTokenRecord } from "@/types/api";

// Get list of registration tokens
export async function getRegistrationTokens(params: ListParams): Promise<ListResponse<RegistrationTokenRecord>> {
  const { valid } = (params.filter || {}) as { valid?: boolean };

  const url = buildUrl("/_synapse/admin/v1/registration_tokens", {
    valid,
  });

  const response = await apiClient<{ registration_tokens: RegistrationToken[] }>(url);

  return {
    data: response.registration_tokens.map(t => ({ ...t, id: t.token })),
    total: response.registration_tokens.length,
  };
}

// Get single registration token
export async function getRegistrationToken(token: string): Promise<RegistrationTokenRecord> {
  const url = buildUrl(`/_synapse/admin/v1/registration_tokens/${encodeURIComponent(token)}`);
  const registrationToken = await apiClient<RegistrationToken>(url);
  return { ...registrationToken, id: registrationToken.token };
}

// Create registration token
export interface CreateRegistrationTokenParams {
  token?: string;
  uses_allowed?: number;
  expiry_time?: number;
  length?: number;
}

export async function createRegistrationToken(
  params: CreateRegistrationTokenParams
): Promise<RegistrationTokenRecord> {
  const url = buildUrl("/_synapse/admin/v1/registration_tokens/new");

  const token = await apiClient<RegistrationToken>(url, {
    method: "POST",
    body: JSON.stringify(params),
  });

  return { ...token, id: token.token };
}

// Update registration token
export interface UpdateRegistrationTokenParams {
  uses_allowed?: number;
  expiry_time?: number;
}

export async function updateRegistrationToken(
  token: string,
  params: UpdateRegistrationTokenParams
): Promise<RegistrationTokenRecord> {
  const url = buildUrl(`/_synapse/admin/v1/registration_tokens/${encodeURIComponent(token)}`);

  const updatedToken = await apiClient<RegistrationToken>(url, {
    method: "PUT",
    body: JSON.stringify(params),
  });

  return { ...updatedToken, id: updatedToken.token };
}

// Delete registration token
export async function deleteRegistrationToken(token: string): Promise<void> {
  const url = buildUrl(`/_synapse/admin/v1/registration_tokens/${encodeURIComponent(token)}`);
  await apiClient(url, { method: "DELETE" });
}

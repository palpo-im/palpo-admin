import { apiClient, getBaseUrl, HttpError } from "./client";

import { GetInstanceConfig } from "@/components/etke.cc/InstanceConfig";
import { handleOIDCAuth, AuthMetadata, refreshAccessToken as refreshToken } from "@/synapse/matrix";
import { ClearConfig, GetConfig, SetExternalAuthProvider } from "@/utils/config";
import decodeURLComponent from "@/utils/decodeURLComponent";
import { MatrixError, displayError } from "@/utils/error";
import { fetchAuthenticatedMedia } from "@/utils/fetchMedia";

export interface LoginParams {
  base_url: string;
  username?: string;
  password?: string;
  loginToken?: string;
  accessToken?: string;
  clientUrl?: string;
  authMetadata?: AuthMetadata;
}

export interface LoginResult {
  redirectTo: string;
}

export interface UserIdentity {
  id: string;
  fullName?: string;
  avatar?: string;
}

// Login
export async function login(params: LoginParams): Promise<LoginResult | void> {
  const { base_url, username, password, loginToken, accessToken, clientUrl, authMetadata } = params;

  if (!base_url) {
    localStorage.removeItem("base_url");
    throw new Error("Homeserver URL is required.");
  }

  const cleanBaseUrl = base_url.replace(/\/+$/g, "");
  localStorage.setItem("base_url", cleanBaseUrl);

  const decodedBaseUrl = decodeURLComponent(cleanBaseUrl);
  localStorage.setItem("decoded_base_url", decodedBaseUrl);

  // Handle OIDC login
  if (clientUrl && authMetadata) {
    const { UserManager } = await import("oidc-client-ts");
    const authParams = await handleOIDCAuth(authMetadata, clientUrl);

    const userManager = new UserManager({
      authority: authParams.issuer,
      client_id: authParams.clientId,
      redirect_uri: authParams.redirectUri,
      response_type: authParams.responseType,
      scope: authParams.scope,
    });

    await userManager.signinRedirect();
    return;
  }

  const config = GetConfig();
  const icfg = GetInstanceConfig();
  let deviceName = "Palpo Admin";
  if (icfg.name) {
    deviceName = icfg.name;
  }

  const loginApiUrl =
    decodedBaseUrl + (accessToken ? "/_matrix/client/v3/account/whoami" : "/_matrix/client/v3/login");

  let requestOptions: RequestInit;

  if (accessToken) {
    // Login with existing access token
    requestOptions = {
      headers: new Headers({
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      }),
    };
  } else {
    // Login with credentials or token
    requestOptions = {
      method: "POST",
      credentials: config.corsCredentials as RequestCredentials,
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        device_id: localStorage.getItem("device_id"),
        initial_device_display_name: deviceName,
        ...(loginToken
          ? {
              type: "m.login.token",
              token: loginToken,
            }
          : {
              type: "m.login.password",
              identifier: {
                type: "m.id.user",
                user: username,
              },
              password: password,
            }),
      }),
    };
  }

  const response = await fetch(loginApiUrl, requestOptions);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as MatrixError | null;
    const errMsg = errorBody?.errcode
      ? displayError(errorBody.errcode, response.status, errorBody.error)
      : displayError("M_INVALID", response.status, response.statusText);

    throw new HttpError(errMsg, response.status, errorBody);
  }

  const json = await response.json();

  let homeserverFromMXID = "";
  if (accessToken) {
    const mxidParts = json.user_id.split(":");
    mxidParts.shift();
    homeserverFromMXID = mxidParts.join(":");
  }

  localStorage.setItem("home_server", accessToken ? homeserverFromMXID : json.home_server);
  localStorage.setItem("user_id", json.user_id);
  localStorage.setItem("access_token", accessToken || json.access_token);
  localStorage.setItem("device_id", json.device_id);
  localStorage.setItem("login_type", accessToken ? "accessToken" : "credentials");

  let pageToRedirectTo = "/";
  if (config.palpoAdmin && icfg && !icfg.disabled.monitoring) {
    pageToRedirectTo = "/server_status";
  }

  return { redirectTo: pageToRedirectTo };
}

// Handle OAuth callback
export async function handleOAuthCallback(): Promise<LoginResult> {
  const { searchParams } = new URL(window.location.href);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    throw new Error(`Authentication error: ${error}`);
  }

  if (!code) {
    throw new Error("No authorization code received");
  }

  const stateKey = `oidc.${state}`;
  const { code_verifier } = JSON.parse(localStorage.getItem(stateKey) || "{}");

  if (!code_verifier) {
    throw new Error("PKCE code verifier not found");
  }

  const tokenEndpoint = localStorage.getItem("token_endpoint");
  const clientId = localStorage.getItem("clientId");

  if (!tokenEndpoint || !clientId) {
    throw new Error("Missing OAuth configuration");
  }

  const tokenParams = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: code,
    code_verifier: code_verifier,
    redirect_uri: `${window.location.origin}/auth-callback`,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: new Headers({
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    body: tokenParams.toString(),
  });

  if (!response.ok) {
    throw new Error("Token exchange failed");
  }

  const json = await response.json();
  const { access_token, refresh_token, id_token, expires_in } = json;

  if (access_token) {
    localStorage.setItem("access_token", access_token);
  }

  if (refresh_token) {
    SetExternalAuthProvider(true);
    localStorage.setItem("refresh_token", refresh_token);
  }

  if (id_token) {
    localStorage.setItem("id_token", id_token);
  }

  if (expires_in) {
    const expiresAt = Date.now() + expires_in * 1000;
    localStorage.setItem("access_token_expires_at", expiresAt.toString());
  }

  const decodedBaseUrl = localStorage.getItem("decoded_base_url") || "";

  if (!decodedBaseUrl) {
    throw new Error("Base URL not found");
  }

  // Get user info
  const whoamiResponse = await fetch(`${decodedBaseUrl}/_matrix/client/v3/account/whoami`, {
    headers: new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`,
    }),
  });

  if (!whoamiResponse.ok) {
    throw new Error("Failed to get user info");
  }

  const whoamiJson = await whoamiResponse.json();
  const { user_id: userId, device_id: deviceId } = whoamiJson;

  if (userId) {
    localStorage.setItem("user_id", userId);
  }
  if (deviceId) {
    localStorage.setItem("device_id", deviceId);
  }

  const mxidParts = userId.split(":");
  mxidParts.shift();
  localStorage.setItem("home_server", mxidParts.join(":"));
  localStorage.setItem("login_type", "credentials");

  const cfg = GetConfig();
  const icfg = GetInstanceConfig();
  let pageToRedirectTo = "/";
  if (cfg.palpoAdmin && icfg && !icfg.disabled.monitoring) {
    pageToRedirectTo = "/server_status";
  }

  return { redirectTo: pageToRedirectTo };
}

// Logout
export async function logout(): Promise<void> {
  const baseUrl = localStorage.getItem("base_url");
  const accessToken = localStorage.getItem("access_token");
  const config = GetConfig();

  if (accessToken && baseUrl) {
    try {
      await fetch(`${baseUrl}/_matrix/client/v3/logout`, {
        method: "POST",
        credentials: config.corsCredentials as RequestCredentials,
        headers: new Headers({
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        }),
      });
    } catch (err) {
      console.log("Error logging out", err);
    } finally {
      ClearConfig();
    }
  }
}

// Check authentication
export async function checkAuth(): Promise<boolean> {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    return false;
  }

  const expiresAt = localStorage.getItem("access_token_expires_at");
  if (expiresAt) {
    SetExternalAuthProvider(true);

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();

    if (now >= expirationTime) {
      console.log("Access token has expired, attempting refresh...");
      const refreshSuccess = await refreshToken();

      if (refreshSuccess) {
        console.log("Token refreshed successfully");
        return true;
      } else {
        console.log("Token refresh failed");
        return false;
      }
    }
  }

  return true;
}

// Get user identity
export async function getIdentity(): Promise<UserIdentity | null> {
  const accessToken = localStorage.getItem("access_token");
  const userId = localStorage.getItem("user_id");
  const baseUrl = localStorage.getItem("base_url");

  if (!accessToken || !userId || !baseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/_matrix/client/v3/profile/${userId}`, {
      headers: new Headers({
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    let avatarUrl = "";

    if (json.avatar_url) {
      const mediaResp = await fetchAuthenticatedMedia(json.avatar_url, "thumbnail");
      const blob = await mediaResp.blob();
      avatarUrl = URL.createObjectURL(blob);
    }

    return {
      id: userId,
      fullName: json.displayname,
      avatar: avatarUrl,
    };
  } catch {
    return null;
  }
}

// Refresh access token
export async function refreshAccessToken(): Promise<boolean> {
  return refreshToken();
}

import { useCallback } from "react";

// Simple i18n hook that uses the existing translation files
// This can be expanded later to use a full i18n library like i18next

type TranslationKey = string;

// Flatten nested object keys for type safety
const translations: Record<string, Record<string, string>> = {
  en: {
    // Auth
    "auth.login": "Login",
    "auth.logout": "Logout",
    "auth.homeserver_url": "Homeserver URL",
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.access_token": "Access Token",
    "auth.sign_in": "Sign In",
    "auth.sign_in_with_sso": "Sign in with SSO",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.rooms": "Rooms",
    "nav.media": "Media",
    "nav.reports": "Reports",
    "nav.destinations": "Federation",
    "nav.registration_tokens": "Registration Tokens",
    "nav.server_status": "Server Status",
    "nav.server_actions": "Server Actions",
    "nav.notifications": "Notifications",
    "nav.billing": "Billing",

    // Users
    "users.title": "Users",
    "users.create": "Create User",
    "users.edit": "Edit User",
    "users.delete": "Delete User",
    "users.deactivate": "Deactivate User",
    "users.reactivate": "Reactivate User",
    "users.admin": "Admin",
    "users.active": "Active",
    "users.deactivated": "Deactivated",

    // Rooms
    "rooms.title": "Rooms",
    "rooms.delete": "Delete Room",
    "rooms.members": "Members",
    "rooms.encrypted": "Encrypted",
    "rooms.public": "Public",
    "rooms.private": "Private",

    // Reports
    "reports.title": "Reports",
    "reports.delete": "Delete Report",
    "reports.reporter": "Reporter",
    "reports.reported_user": "Reported User",
    "reports.reason": "Reason",

    // Server
    "server.status": "Server Status",
    "server.actions": "Server Actions",
    "server.notifications": "Notifications",
    "server.version": "Server Version",
    "server.ok": "OK",
    "server.error": "Error",
    "server.maintenance": "Maintenance",
    "server.running_command": "Running Command",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.search": "Search",
    "common.loading": "Loading...",
    "common.no_results": "No results found",
    "common.confirm": "Confirm",
    "common.actions": "Actions",
    "common.view": "View",
    "common.copy": "Copy",
    "common.copied": "Copied!",
  },
};

export function useI18n(locale = "en") {
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const translation = translations[locale]?.[key] || translations.en?.[key] || key;

      if (params) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => acc.replace(`{${paramKey}}`, String(paramValue)),
          translation
        );
      }

      return translation;
    },
    [locale]
  );

  return { t, locale };
}

// Export for use with existing react-admin translations
export function getTranslation(key: string, locale = "en"): string {
  return translations[locale]?.[key] || translations.en?.[key] || key;
}

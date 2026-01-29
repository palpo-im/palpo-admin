import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { AppRouter } from "./router";
import { GetInstanceConfig } from "./components/etke.cc/InstanceConfig";
import { useTheme } from "./hooks/use-theme";

// Create a single query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});

// Theme wrapper component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}

// Document setup component
function DocumentSetup() {
  const icfg = GetInstanceConfig();

  useEffect(() => {
    // Set document title
    if (icfg.name) {
      document.title = icfg.name;
    } else {
      document.title = "Palpo Admin";
    }

    // Set favicon
    if (icfg.favicon_url) {
      const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.href = icfg.favicon_url;
      } else {
        const newLink = document.createElement("link");
        newLink.rel = "icon";
        newLink.href = icfg.favicon_url;
        document.getElementsByTagName("head")[0].appendChild(newLink);
      }
    }
  }, [icfg.name, icfg.favicon_url]);

  return null;
}

export function AppNew() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <DocumentSetup />
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default AppNew;

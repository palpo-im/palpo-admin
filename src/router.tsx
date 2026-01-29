import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { AppLayout } from "@/components/ui/app-layout";
import { ErrorFallback } from "@/components/ui/error-boundary";
import { LoadingSkeleton } from "@/components/ui/loading-state";

// Check if user is authenticated
function isAuthenticated(): boolean {
  const accessToken = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  return !!accessToken;
}

// Lazy load page components
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/Dashboard"));
const UsersListPage = lazy(() => import("./pages/users/UserList"));
const UserShowPage = lazy(() => import("./pages/users/UserShow"));
const UserCreatePage = lazy(() => import("./pages/users/UserCreate"));
const RoomsListPage = lazy(() => import("./pages/rooms/RoomList"));
const RoomShowPage = lazy(() => import("./pages/rooms/RoomShow"));
const MediaPage = lazy(() => import("./pages/media/MediaList"));
const ReportsPage = lazy(() => import("./pages/reports/ReportList"));
const DestinationsPage = lazy(() => import("./pages/destinations/DestinationList"));
const RegistrationTokensPage = lazy(() => import("./pages/registration-tokens/RegistrationTokenList"));
const ServerStatusPage = lazy(() => import("./pages/server-status/ServerStatus"));
const ServerActionsPage = lazy(() => import("./pages/server-actions/ServerActions"));
const ServerNotificationsPage = lazy(() => import("./pages/server-notifications/ServerNotifications"));
const BillingPage = lazy(() => import("./pages/billing/Billing"));

// Loading wrapper
function PageLoader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSkeleton className="p-4" />}>
      {children}
    </Suspense>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: ({ error }) => (
    <AppLayout>
      <ErrorFallback
        error={error as Error}
        onReset={() => {
          window.location.href = "/";
        }}
      />
    </AppLayout>
  ),
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <PageLoader>
      <LoginPage />
    </PageLoader>
  ),
});

// Authenticated layout route
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "authenticated",
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

// Dashboard route (index)
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/",
  component: () => (
    <PageLoader>
      <DashboardPage />
    </PageLoader>
  ),
});

// Users routes
const usersRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/users",
  component: () => <Outlet />,
});

const usersIndexRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "/",
  component: () => (
    <PageLoader>
      <UsersListPage />
    </PageLoader>
  ),
});

const userShowRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "/$userId",
  component: () => (
    <PageLoader>
      <UserShowPage />
    </PageLoader>
  ),
});

const userCreateRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: "/create",
  component: () => (
    <PageLoader>
      <UserCreatePage />
    </PageLoader>
  ),
});

// Rooms routes
const roomsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/rooms",
  component: () => <Outlet />,
});

const roomsIndexRoute = createRoute({
  getParentRoute: () => roomsRoute,
  path: "/",
  component: () => (
    <PageLoader>
      <RoomsListPage />
    </PageLoader>
  ),
});

const roomShowRoute = createRoute({
  getParentRoute: () => roomsRoute,
  path: "/$roomId",
  component: () => (
    <PageLoader>
      <RoomShowPage />
    </PageLoader>
  ),
});

// Media route
const mediaRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/media",
  component: () => (
    <PageLoader>
      <MediaPage />
    </PageLoader>
  ),
});

// Reports route
const reportsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/reports",
  component: () => (
    <PageLoader>
      <ReportsPage />
    </PageLoader>
  ),
});

// Destinations route
const destinationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/destinations",
  component: () => (
    <PageLoader>
      <DestinationsPage />
    </PageLoader>
  ),
});

// Registration tokens route
const registrationTokensRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/registration-tokens",
  component: () => (
    <PageLoader>
      <RegistrationTokensPage />
    </PageLoader>
  ),
});

// Server status route
const serverStatusRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/server-status",
  component: () => (
    <PageLoader>
      <ServerStatusPage />
    </PageLoader>
  ),
});

// Server actions route
const serverActionsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/server-actions",
  component: () => (
    <PageLoader>
      <ServerActionsPage />
    </PageLoader>
  ),
});

// Server notifications route
const serverNotificationsRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/server-notifications",
  component: () => (
    <PageLoader>
      <ServerNotificationsPage />
    </PageLoader>
  ),
});

// Billing route
const billingRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/billing",
  component: () => (
    <PageLoader>
      <BillingPage />
    </PageLoader>
  ),
});

// Build route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    usersRoute.addChildren([usersIndexRoute, userShowRoute, userCreateRoute]),
    roomsRoute.addChildren([roomsIndexRoute, roomShowRoute]),
    mediaRoute,
    reportsRoute,
    destinationsRoute,
    registrationTokensRoute,
    serverStatusRoute,
    serverActionsRoute,
    serverNotificationsRoute,
    billingRoute,
  ]),
]);

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register router for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Router Provider component
export function AppRouter() {
  return <RouterProvider router={router} />;
}

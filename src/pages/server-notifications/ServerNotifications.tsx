import { Bell, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useServerNotifications, useDismissNotification } from "@/hooks/usePalpoAdmin";
import { useToast } from "@/components/ui/toast-provider";

export default function ServerNotificationsPage() {
  const { data: notifications, isLoading, error } = useServerNotifications();
  const dismissNotification = useDismissNotification();
  const { success, error: showError } = useToast();

  const handleDismiss = async (eventId: string) => {
    try {
      await dismissNotification.mutateAsync(eventId);
      success("Notification dismissed");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to dismiss notification");
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading notifications: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Server Notifications"
        description="System notifications and alerts"
        breadcrumbs={[{ label: "Notifications" }]}
      />

      {!notifications || notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! No new notifications."
        />
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.event_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Notification</CardTitle>
                    <CardDescription>
                      {notification.sent_at
                        ? new Date(notification.sent_at).toLocaleString()
                        : "Unknown time"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(notification.event_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{notification.output}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

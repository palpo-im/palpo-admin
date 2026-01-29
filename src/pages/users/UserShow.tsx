import { useParams } from "@tanstack/react-router";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/hooks/useUsers";
import { LoadingSkeleton } from "@/components/ui/loading-state";

export default function UserShowPage() {
  const { userId } = useParams({ strict: false });
  const decodedUserId = userId ? decodeURIComponent(userId) : "";

  const { data: user, isLoading, error } = useUser(decodedUserId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading user: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={user.displayname || user.id}
        description={user.id}
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: user.displayname || user.id },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">User ID:</span>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Display Name:</span>
              <p className="font-medium">{user.displayname || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Admin:</span>
              <p className="font-medium">{user.admin ? "Yes" : "No"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Status:</span>
              <p className="font-medium">{user.deactivated ? "Deactivated" : "Active"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Account timestamps and settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Created:</span>
              <p className="font-medium">
                {user.creation_ts ? new Date(user.creation_ts * 1000).toLocaleString() : "-"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Guest:</span>
              <p className="font-medium">{user.is_guest ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

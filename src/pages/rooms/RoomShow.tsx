import { useParams } from "@tanstack/react-router";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRoom } from "@/hooks/useRooms";
import { LoadingSkeleton } from "@/components/ui/loading-state";
import { Users, Lock, Globe } from "lucide-react";

export default function RoomShowPage() {
  const { roomId } = useParams({ strict: false });
  const decodedRoomId = roomId ? decodeURIComponent(roomId) : "";

  const { data: room, isLoading, error } = useRoom(decodedRoomId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading room: {error.message}</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="p-4">
        <div className="text-muted-foreground">Room not found</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={room.name || room.id}
        description={room.canonical_alias || room.id}
        breadcrumbs={[
          { label: "Rooms", href: "/rooms" },
          { label: room.name || room.id },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Room Information</CardTitle>
            <CardDescription>Basic room details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Room ID:</span>
              <p className="font-medium break-all">{room.id}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Name:</span>
              <p className="font-medium">{room.name || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Canonical Alias:</span>
              <p className="font-medium">{room.canonical_alias || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Topic:</span>
              <p className="font-medium">{room.topic || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Settings</CardTitle>
            <CardDescription>Configuration and membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground">Members:</span>
              <p className="font-medium inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {room.joined_members || 0}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Visibility:</span>
              <p className="font-medium">
                {room.public ? (
                  <Badge variant="outline" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Join Rules:</span>
              <p className="font-medium">{room.join_rules || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">History Visibility:</span>
              <p className="font-medium">{room.history_visibility || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

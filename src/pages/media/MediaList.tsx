import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Image, FileText, Film } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useUserMediaStatistics } from "@/hooks/useMedia";
import type { UserMediaStatisticRecord } from "@/types/api";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function getMediaIcon(mimetype?: string) {
  if (!mimetype) return FileText;
  if (mimetype.startsWith("image/")) return Image;
  if (mimetype.startsWith("video/")) return Film;
  return FileText;
}

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, error } = useUserMediaStatistics({
    pagination: { page, perPage: pageSize },
    sort: { field: "media_length", order: "desc" },
  });

  const columns: ColumnDef<UserMediaStatisticRecord>[] = [
    {
      accessorKey: "user_id",
      header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.user_id}</span>
      ),
    },
    {
      accessorKey: "displayname",
      header: "Display Name",
      cell: ({ row }) => row.original.displayname || "-",
    },
    {
      accessorKey: "media_count",
      header: ({ column }) => <SortableHeader column={column}>Media Count</SortableHeader>,
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.media_count || 0}</Badge>
      ),
    },
    {
      accessorKey: "media_length",
      header: ({ column }) => <SortableHeader column={column}>Total Size</SortableHeader>,
      cell: ({ row }) => formatBytes(row.original.media_length || 0),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading media statistics: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Media"
        description="View media statistics by user"
        breadcrumbs={[{ label: "Media" }]}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No media found"
      />
    </>
  );
}

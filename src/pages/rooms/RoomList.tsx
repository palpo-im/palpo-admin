import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Users, Lock, Globe } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { useRooms } from "@/hooks/useRooms";
import type { RoomRecord } from "@/types/api";

export default function RoomsListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, error } = useRooms({
    pagination: { page, perPage: pageSize },
    sort: { field: "name", order: "asc" },
    filter: search ? { search_term: search } : undefined,
  });

  const columns: ColumnDef<RoomRecord>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => (
        <Link
          to={"/rooms/$roomId" as string}
          params={{ roomId: encodeURIComponent(row.original.id) }}
          className="font-medium text-primary hover:underline"
        >
          {row.original.name || row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "canonical_alias",
      header: "Alias",
      cell: ({ row }) => row.original.canonical_alias || "-",
    },
    {
      accessorKey: "joined_members",
      header: ({ column }) => <SortableHeader column={column}>Members</SortableHeader>,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          {row.original.joined_members || 0}
        </span>
      ),
    },
    {
      accessorKey: "public",
      header: "Visibility",
      cell: ({ row }) =>
        row.original.public ? (
          <Badge variant="outline" className="gap-1">
            <Globe className="h-3 w-3" />
            Public
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <Lock className="h-3 w-3" />
            Private
          </Badge>
        ),
    },
    {
      accessorKey: "join_rules",
      header: "Join Rules",
      cell: ({ row }) => row.original.join_rules || "-",
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading rooms: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Rooms"
        description="Manage Matrix rooms on your server"
        breadcrumbs={[{ label: "Rooms" }]}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by room name or alias..."
          className="max-w-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No rooms found"
      />
    </>
  );
}

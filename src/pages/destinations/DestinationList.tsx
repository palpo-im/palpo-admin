import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Globe, CheckCircle, XCircle, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { useDestinations, useResetDestinationConnection } from "@/hooks/useDestinations";
import { useToast } from "@/components/ui/toast-provider";
import type { DestinationRecord } from "@/types/api";

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { success, error: showError } = useToast();
  const resetConnection = useResetDestinationConnection();

  const { data, isLoading, error } = useDestinations({
    pagination: { page, perPage: pageSize },
    sort: { field: "destination", order: "asc" },
    filter: search ? { destination: search } : undefined,
  });

  const handleReset = async (destination: string) => {
    try {
      await resetConnection.mutateAsync(destination);
      success(`Connection to ${destination} reset successfully`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to reset connection");
    }
  };

  const columns: ColumnDef<DestinationRecord>[] = [
    {
      accessorKey: "destination",
      header: ({ column }) => <SortableHeader column={column}>Destination</SortableHeader>,
      cell: ({ row }) => (
        <span className="font-medium inline-flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {row.original.destination}
        </span>
      ),
    },
    {
      accessorKey: "failure_ts",
      header: "Status",
      cell: ({ row }) => {
        const hasFailure = row.original.failure_ts && row.original.failure_ts > 0;
        return hasFailure ? (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3" />
            OK
          </Badge>
        );
      },
    },
    {
      accessorKey: "retry_last_ts",
      header: ({ column }) => <SortableHeader column={column}>Last Retry</SortableHeader>,
      cell: ({ row }) => {
        const ts = row.original.retry_last_ts;
        return ts && ts > 0 ? new Date(ts).toLocaleString() : "-";
      },
    },
    {
      accessorKey: "retry_interval",
      header: "Retry Interval",
      cell: ({ row }) => {
        const interval = row.original.retry_interval;
        if (!interval) return "-";
        const hours = Math.floor(interval / 3600000);
        const minutes = Math.floor((interval % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReset(row.original.destination)}
          disabled={resetConnection.isPending}
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading destinations: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Federation"
        description="Manage federation destinations"
        breadcrumbs={[{ label: "Federation" }]}
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search destinations..."
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
        emptyMessage="No destinations found"
      />
    </>
  );
}

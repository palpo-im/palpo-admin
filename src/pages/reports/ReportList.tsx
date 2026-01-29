import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Flag, CheckCircle, Clock } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { useReports } from "@/hooks/useReports";
import type { ReportRecord } from "@/types/api";

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, isLoading, error } = useReports({
    pagination: { page, perPage: pageSize },
    sort: { field: "received_ts", order: "desc" },
  });

  const columns: ColumnDef<ReportRecord>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: "user_id",
      header: "Reporter",
      cell: ({ row }) => row.original.user_id || "-",
    },
    {
      accessorKey: "room_id",
      header: "Room",
      cell: ({ row }) => (
        <span className="font-mono text-xs truncate max-w-[200px] block">
          {row.original.room_id || "-"}
        </span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => row.original.reason || "-",
    },
    {
      accessorKey: "received_ts",
      header: ({ column }) => <SortableHeader column={column}>Received</SortableHeader>,
      cell: ({ row }) => {
        const ts = row.original.received_ts;
        return ts ? new Date(ts).toLocaleString() : "-";
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading reports: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Reports"
        description="Review and manage user reports"
        breadcrumbs={[{ label: "Reports" }]}
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No reports found"
      />
    </>
  );
}

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Key, Plus, Trash2, Copy } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRegistrationTokens, useDeleteRegistrationToken, useCreateRegistrationToken } from "@/hooks/useRegistrationTokens";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { RegistrationTokenRecord } from "@/types/api";

export default function RegistrationTokensPage() {
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tokenToDelete, setTokenToDelete] = useState<RegistrationTokenRecord | null>(null);
  const pageSize = 25;
  const { success, error: showError } = useToast();

  const { data, isLoading, error } = useRegistrationTokens({
    pagination: { page, perPage: pageSize },
    sort: { field: "token", order: "asc" },
  });

  const deleteToken = useDeleteRegistrationToken();
  const createToken = useCreateRegistrationToken();

  const handleDelete = async () => {
    if (!tokenToDelete) return;
    try {
      await deleteToken.mutateAsync(tokenToDelete.token);
      success("Token deleted successfully");
      setDeleteDialogOpen(false);
      setTokenToDelete(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete token");
    }
  };

  const handleCreate = async () => {
    try {
      const result = await createToken.mutateAsync({});
      success(`Token created: ${result.token}`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    success("Token copied to clipboard");
  };

  const columns: ColumnDef<RegistrationTokenRecord>[] = [
    {
      accessorKey: "token",
      header: "Token",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <code className="text-sm bg-muted px-2 py-1 rounded">{row.original.token}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(row.original.token)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "uses_allowed",
      header: "Uses Allowed",
      cell: ({ row }) => row.original.uses_allowed ?? "Unlimited",
    },
    {
      accessorKey: "pending",
      header: "Pending",
      cell: ({ row }) => row.original.pending || 0,
    },
    {
      accessorKey: "completed",
      header: "Completed",
      cell: ({ row }) => row.original.completed || 0,
    },
    {
      accessorKey: "expiry_time",
      header: ({ column }) => <SortableHeader column={column}>Expires</SortableHeader>,
      cell: ({ row }) => {
        const ts = row.original.expiry_time;
        if (!ts) return "Never";
        const date = new Date(ts);
        const isExpired = date < new Date();
        return (
          <span className={isExpired ? "text-destructive" : ""}>
            {date.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => {
            setTokenToDelete(row.original);
            setDeleteDialogOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading tokens: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Registration Tokens"
        description="Manage registration tokens for new users"
        breadcrumbs={[{ label: "Registration Tokens" }]}
        actions={
          <Button onClick={handleCreate} disabled={createToken.isPending}>
            <Plus className="mr-2 h-4 w-4" />
            Create Token
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        totalCount={data?.total || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        emptyMessage="No registration tokens found"
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={tokenToDelete?.token}
        onConfirm={handleDelete}
        isLoading={deleteToken.isPending}
      />
    </>
  );
}

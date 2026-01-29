import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, UserPlus, Check, X, Shield, ShieldOff } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { DataTable, SortableHeader } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { useUsers, useDeleteUser, useDeactivateUser } from "@/hooks/useUsers";
import { DeleteConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { UserRecord } from "@/types/api";

export default function UsersListPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const pageSize = 25;

  const { data, isLoading, error } = useUsers({
    pagination: { page, perPage: pageSize },
    sort: { field: "name", order: "asc" },
    filter: search ? { search_term: search } : undefined,
  });

  const deleteUser = useDeleteUser();
  const deactivateUser = useDeactivateUser();

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      success(`User ${userToDelete.id} deleted successfully`);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleDeactivate = async (user: UserRecord) => {
    try {
      await deactivateUser.mutateAsync({ userId: user.id, deactivate: !user.deactivated });
      success(`User ${user.id} ${user.deactivated ? "reactivated" : "deactivated"} successfully`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update user status");
    }
  };

  const columns: ColumnDef<UserRecord>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column}>User ID</SortableHeader>,
      cell: ({ row }) => (
        <Link
          to={"/users/$userId" as string}
          params={{ userId: encodeURIComponent(row.original.id) }}
          className="font-medium text-primary hover:underline"
        >
          {row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "displayname",
      header: "Display Name",
      cell: ({ row }) => row.original.displayname || "-",
    },
    {
      accessorKey: "admin",
      header: "Admin",
      cell: ({ row }) =>
        row.original.admin ? (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <ShieldOff className="h-3 w-3" />
            User
          </Badge>
        ),
    },
    {
      accessorKey: "deactivated",
      header: "Status",
      cell: ({ row }) =>
        row.original.deactivated ? (
          <Badge variant="destructive" className="gap-1">
            <X className="h-3 w-3" />
            Deactivated
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        ),
    },
    {
      accessorKey: "creation_ts",
      header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
      cell: ({ row }) => {
        const ts = row.original.creation_ts;
        return ts ? new Date(ts * 1000).toLocaleDateString() : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: "/users/$userId" as string, params: { userId: encodeURIComponent(user.id) } })
                }
              >
                View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeactivate(user)}>
                {user.deactivated ? "Reactivate" : "Deactivate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  setUserToDelete(user);
                  setDeleteDialogOpen(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading users: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage Matrix users on your server"
        breadcrumbs={[{ label: "Users" }]}
        actions={
          <Button asChild>
            <Link to={"/users/create" as string}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create User
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by user ID or display name..."
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
        emptyMessage="No users found"
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName={userToDelete?.id}
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </>
  );
}

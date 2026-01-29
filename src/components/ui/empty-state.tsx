import * as React from "react";
import { LucideIcon, FileQuestion, Search, Users, MessageSquare, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: "default" | "search" | "users" | "rooms" | "error";
}

const variantIcons: Record<string, LucideIcon> = {
  default: FileQuestion,
  search: Search,
  users: Users,
  rooms: MessageSquare,
  error: AlertCircle,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center",
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states for common use cases
export function NoResultsState({
  searchTerm,
  onClear,
}: {
  searchTerm?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try adjusting your search or filter criteria.`
          : "No items match your current filters."
      }
      action={
        onClear
          ? {
              label: "Clear filters",
              onClick: onClear,
            }
          : undefined
      }
    />
  );
}

export function NoUsersState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      variant="users"
      title="No users yet"
      description="Get started by creating your first user."
      action={
        onCreate
          ? {
              label: "Create user",
              onClick: onCreate,
            }
          : undefined
      }
    />
  );
}

export function NoRoomsState() {
  return (
    <EmptyState
      variant="rooms"
      title="No rooms found"
      description="Rooms will appear here once users create them."
    />
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      title="Something went wrong"
      description={message || "An error occurred while loading the data."}
      action={
        onRetry
          ? {
              label: "Try again",
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}

import { useState } from "react";
import { Cog, Play, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useServerProcess, useRunServerCommand } from "@/hooks/usePalpoAdmin";
import { useToast } from "@/components/ui/toast-provider";

interface ServerAction {
  id: string;
  name: string;
  description: string;
  command: string;
  dangerous?: boolean;
}

const serverActions: ServerAction[] = [
  {
    id: "restart",
    name: "Restart Server",
    description: "Restart the Matrix server services",
    command: "restart",
  },
  {
    id: "update",
    name: "Update Server",
    description: "Update the server to the latest version",
    command: "update",
  },
  {
    id: "backup",
    name: "Create Backup",
    description: "Create a backup of the server data",
    command: "backup",
  },
  {
    id: "cleanup",
    name: "Cleanup",
    description: "Clean up temporary files and caches",
    command: "cleanup",
    dangerous: true,
  },
];

export default function ServerActionsPage() {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const { data: process } = useServerProcess();
  const runCommand = useRunServerCommand();
  const { success, error: showError } = useToast();

  const handleRunAction = async (action: ServerAction) => {
    if (process?.locked_at) {
      showError("Another action is already running");
      return;
    }

    try {
      setRunningAction(action.id);
      await runCommand.mutateAsync(action.command);
      success(`${action.name} started successfully`);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to run action");
    } finally {
      setRunningAction(null);
    }
  };

  const isLocked = !!process?.locked_at;

  return (
    <>
      <PageHeader
        title="Server Actions"
        description="Run maintenance tasks on your server"
        breadcrumbs={[{ label: "Server Actions" }]}
      />

      {isLocked && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action in Progress</AlertTitle>
          <AlertDescription>
            Command "{process?.command}" is currently running. Started at{" "}
            {process?.locked_at ? new Date(process.locked_at).toLocaleString() : "unknown"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {serverActions.map((action) => (
          <Card key={action.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cog className="h-5 w-5" />
                {action.name}
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleRunAction(action)}
                disabled={isLocked || runningAction === action.id}
                variant={action.dangerous ? "destructive" : "default"}
              >
                <Play className="mr-2 h-4 w-4" />
                {runningAction === action.id ? "Running..." : "Run"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

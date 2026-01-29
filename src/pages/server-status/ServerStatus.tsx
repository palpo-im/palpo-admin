import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/ui/loading-state";
import { useServerStatus, useTriggerCheck } from "@/hooks/usePalpoAdmin";
import { useToast } from "@/components/ui/toast-provider";

export default function ServerStatusPage() {
  const { data: status, isLoading, error, refetch } = useServerStatus();
  const triggerCheck = useTriggerCheck();
  const { success, error: showError } = useToast();

  const handleRefresh = async () => {
    try {
      await triggerCheck.mutateAsync();
      await refetch();
      success("Status check triggered");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to trigger check");
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-destructive">Error loading server status: {error.message}</div>
      </div>
    );
  }

  const overallStatus = status?.ok;

  return (
    <>
      <PageHeader
        title="Server Status"
        description="Monitor your server health and components"
        breadcrumbs={[{ label: "Server Status" }]}
        actions={
          <Button onClick={handleRefresh} disabled={triggerCheck.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${triggerCheck.isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {overallStatus ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              Overall Status
            </CardTitle>
            <CardDescription>
              {status?.host || "Unknown host"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={overallStatus ? "outline" : "destructive"} className="text-lg py-1 px-3">
              {overallStatus ? "Healthy" : "Issues Detected"}
            </Badge>
            {status?.maintenance && (
              <Badge variant="secondary" className="ml-2">
                Maintenance Mode
              </Badge>
            )}
          </CardContent>
        </Card>

        {status?.results && status.results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {status.results.map((component, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {component.ok ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {component.label?.text || component.category || "Unknown"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">Category: {component.category}</div>
                    {!component.ok && component.reason && (
                      <div className="text-destructive text-xs">{component.reason}</div>
                    )}
                    {component.help && (
                      <a
                        href={component.help}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                      >
                        Learn more
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { Users, MessageSquare, Flag, Server, Activity } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServerVersion, useSupportedFeatures } from "@/hooks/useServerInfo";
import { StatsSkeleton } from "@/components/ui/loading-state";

export default function Dashboard() {
  const { data: serverVersion, isLoading: isLoadingVersion } = useServerVersion();
  const { data: features, isLoading: isLoadingFeatures } = useSupportedFeatures();

  const isLoading = isLoadingVersion || isLoadingFeatures;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Palpo Admin</p>
        </div>
        <StatsSkeleton count={4} />
      </div>
    );
  }

  const stats = [
    {
      title: "Server Version",
      value: serverVersion || "Unknown",
      icon: Server,
      description: "Matrix server version",
    },
    {
      title: "Users",
      value: "-",
      icon: Users,
      description: "Total registered users",
    },
    {
      title: "Rooms",
      value: "-",
      icon: MessageSquare,
      description: "Total rooms on server",
    },
    {
      title: "Reports",
      value: "-",
      icon: Flag,
      description: "Pending reports",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Palpo Admin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {features && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Server Features
            </CardTitle>
            <CardDescription>Supported Matrix specification versions and unstable features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features.versions && features.versions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Supported Versions</h4>
                  <div className="flex flex-wrap gap-2">
                    {features.versions.map((version) => (
                      <span
                        key={version}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {version}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {features.unstable_features && Object.keys(features.unstable_features).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Unstable Features</h4>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(features.unstable_features)
                      .filter(([_, enabled]) => enabled)
                      .slice(0, 12)
                      .map(([feature]) => (
                        <span
                          key={feature}
                          className="inline-flex items-center rounded-md bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400"
                        >
                          {feature}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

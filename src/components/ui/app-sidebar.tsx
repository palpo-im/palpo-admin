import { Link, useLocation } from "@tanstack/react-router";
import {
  Users,
  MessageSquare,
  BarChart3,
  Flag,
  Globe,
  KeyRound,
  Server,
  Cog,
  CreditCard,
  Bell,
  FileImage,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GetInstanceConfig } from "@/components/etke.cc/InstanceConfig";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  {
    title: "Rooms",
    url: "/rooms",
    icon: MessageSquare,
  },
  {
    title: "Media",
    url: "/media",
    icon: FileImage,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: Flag,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const icfg = GetInstanceConfig();

  // Build navigation items based on instance config
  const navItems: NavItem[] = [...mainNavItems];

  if (!icfg.disabled.federation) {
    navItems.push({
      title: "Federation",
      url: "/destinations",
      icon: Globe,
    });
  }

  if (!icfg.disabled.registration_tokens) {
    navItems.push({
      title: "Registration Tokens",
      url: "/registration-tokens",
      icon: KeyRound,
    });
  }

  // Palpo specific items
  const palpoNavItems: NavItem[] = [];
  const palpoEnabled = !!localStorage.getItem("palpo_admin_url");

  if (palpoEnabled) {
    if (!icfg.disabled.monitoring) {
      palpoNavItems.push({
        title: "Server Status",
        url: "/server-status",
        icon: Server,
      });
    }
    if (!icfg.disabled.actions) {
      palpoNavItems.push({
        title: "Server Actions",
        url: "/server-actions",
        icon: Cog,
      });
    }
    if (!icfg.disabled.notifications) {
      palpoNavItems.push({
        title: "Notifications",
        url: "/server-notifications",
        icon: Bell,
      });
    }
    if (!icfg.disabled.payments) {
      palpoNavItems.push({
        title: "Billing",
        url: "/billing",
        icon: CreditCard,
      });
    }
  }

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link to={"/" as "/"} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">{icfg.name || "Palpo Admin"}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Link to={item.url as any}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {palpoNavItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Server</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {palpoNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Link to={item.url as any}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          Palpo Admin
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

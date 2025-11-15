import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  Bell, 
  LogOut,
  Globe,
  CheckSquare,
  FileText,
  Settings,
  Users,
  Mail,
  Server,
  Activity,
  TestTube
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { NotificationBell } from "./NotificationBell";
import { NotificationProvider } from "../contexts/NotificationContext";
import { VisitorCreditDisplay } from "./VisitorCreditDisplay";

const PortalLayoutContent = () => {
  const { user, logout } = useAuth();
  const { can, hasRole } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is a visitor with credits
  const isVisitor = hasRole('visitor');
  const hasCredits = user?.credits && Object.keys(user.credits).length > 0;

  // Define navigation items with permission requirements
  const navigationItems = [
    {
      title: "Overview",
      url: "/portal",
      icon: LayoutDashboard,
      isActive: true,
      requiredPermission: null, // Always visible
    },
    {
      title: "Task Management",
      url: "/portal/tasks",
      icon: CheckSquare,
      badge: "New",
      requiredPermission: () => can.viewAssignedTasks(), // Visible if can view any tasks
    },
    {
      title: "User Management",
      url: "/portal/users",
      icon: Users,
      requiredPermission: () => can.viewUsers(), // Visible if can view users
    },
    {
      title: "Mail Command Center",
      url: "/portal/mail",
      icon: Mail,
      requiredPermission: () => can.viewEmailLogs(), // Visible if can view email logs
    },
    {
      title: "Infrastructure Gallery",
      url: "/portal/devops",
      icon: Server,
      requiredPermission: null, // Always visible (or add specific permission)
    },
    {
      title: "Log Horizon",
      url: "/portal/logs",
      icon: Activity,
      requiredPermission: null, // Always visible (or add specific permission)
    },
    {
      title: "Unit Testing",
      url: "/portal/tests",
      icon: TestTube,
      requiredPermission: null, // Always visible
    },
  ].filter(item => {
    // Filter out items that user doesn't have permission to see
    if (item.requiredPermission === null) return true;
    return item.requiredPermission();
  });

  const handleLogout = () => {
    logout();
    navigate("/portal/login");
  };

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Globe className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">LaraWorld Portal</h2>
                <p className="text-xs text-muted-foreground">Demo Platform</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => handleNavigation(item.url)}
                        isActive={location.pathname === item.url}
                        className="w-full justify-start"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Credit Display for Visitors */}
            {isVisitor && hasCredits && (
              <SidebarGroup className="mt-4">
                <SidebarGroupContent>
                  <div className="p-2">
                    <VisitorCreditDisplay user={user} compact={true} />
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || "User"} />
                <AvatarFallback>
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Top Navigation Bar */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
              </div>

              <div className="flex items-center space-x-4">
                <NotificationBell userId={user?.id?.toString() || ''} />
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Portal Demo
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-gradient-subtle">
            <div className="container mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const PortalLayout = () => {
  const { user } = useAuth();
  
  if (!user?.id) {
    return null; // Or redirect to login
  }

  return (
    <NotificationProvider userId={user.id.toString()}>
      <PortalLayoutContent />
    </NotificationProvider>
  );
};

export default PortalLayout;

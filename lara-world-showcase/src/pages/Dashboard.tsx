import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Mail, Calendar, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, logout, isLoading, error, loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={logout} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={logout} className="w-full">
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.name}!
            </h2>
            <p className="text-muted-foreground">
              You have successfully authenticated using OAuth2 PKCE flow.
            </p>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Information</CardTitle>
                <User className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {user.email_verified_at && (
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <Badge variant="secondary" className="text-xs">
                        Email Verified
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Authentication Status</CardTitle>
                <Shield className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="default" className="text-xs">
                    OAuth2 PKCE
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Secure authentication flow completed successfully.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Integration</CardTitle>
                <User className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Successfully connected to Laravel backend via /me endpoint.
                  </p>
                  <Badge variant="outline" className="text-xs">
                    Backend Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Demo Features */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Features</CardTitle>
              <CardDescription>
                This dashboard demonstrates successful OAuth2 PKCE authentication integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">✅ PKCE Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure OAuth2 flow with PKCE (Proof Key for Code Exchange) implemented.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">✅ Laravel Backend</h4>
                  <p className="text-sm text-muted-foreground">
                    Successfully integrated with Laravel Passport OAuth2 server.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">✅ Token Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatic token refresh and secure storage implemented.
                  </p>
                </div>
                <div className="p-4 border border-border rounded-lg">
                  <h4 className="font-medium mb-2">✅ Protected Routes</h4>
                  <p className="text-sm text-muted-foreground">
                    Route protection and authentication state management working.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

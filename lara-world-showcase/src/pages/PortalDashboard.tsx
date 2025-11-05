import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  Star,
  Globe,
  Lock,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const PortalDashboard = () => {
  const { user } = useAuth();

  const quickStats = [
    { label: "Portal Status", value: "Active", icon: Globe, color: "text-blue-600" },
    { label: "System Status", value: "Online", icon: CheckCircle, color: "text-green-600" },
    { label: "Last Updated", value: "2 min ago", icon: Clock, color: "text-gray-600" },
    { label: "Security Level", value: "High", icon: Lock, color: "text-red-600" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Your LaraWorld Portal dashboard - explore all available modules and features.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <Badge variant="secondary">Portal Demo</Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

          {/* Portal Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Portal Overview</CardTitle>
              <CardDescription>
                Welcome to the LaraWorld Portal. This is your central hub for accessing and managing your applications and services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Globe className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Portal Ready</h3>
                <p className="text-muted-foreground">
                  Your portal is set up and ready for customization. You can now add your specific modules and features as needed.
                </p>
              </div>
            </CardContent>
          </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
          <CardDescription>
            This portal is built using modern technologies and follows industry best practices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Frontend</h4>
              <p className="text-sm text-muted-foreground">React + TypeScript</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Backend</h4>
              <p className="text-sm text-muted-foreground">Laravel + PHP</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">Authentication</h4>
              <p className="text-sm text-muted-foreground">Laravel Passport OAuth2</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h4 className="font-semibold">UI Framework</h4>
              <p className="text-sm text-muted-foreground">Tailwind + shadcn/ui</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortalDashboard;

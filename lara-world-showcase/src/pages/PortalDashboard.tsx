import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  Star,
  Globe,
  Lock,
  Clock,
  Shield,
  Zap,
  Users,
  Mail,
  FileText,
  Coins,
  Sparkles,
  Rocket,
  Key,
  Infinity,
  TrendingUp,
  Award,
  Gift,
  TestTube
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { PublicUserNotice } from "@/components/PublicUserNotice";
import { VisitorCreditDisplay } from "@/components/VisitorCreditDisplay";
import { CONTACT_CONFIG } from "@/config/contact";
import { useNavigate } from "react-router-dom";

const PortalDashboard = () => {
  const { user } = useAuth();
  const { isPublicUser, isSuperAdmin, hasRole, permissions } = usePermissions();
  const navigate = useNavigate();

  // Check if user is a visitor
  const isVisitor = hasRole('visitor');

  // Get credit stats if available
  const creditStats = user?.credits || {};
  const hasCredits = Object.keys(creditStats).length > 0;
  
  // Check if user has unlimited credits (super admin)
  const hasUnlimitedCredits = isSuperAdmin();

  // Calculate total credits info
  const totalCredits = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.credits || 0), 0);
  const totalUsed = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.used || 0), 0);
  const totalAvailable = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.available || 0), 0);

  // Quick stats with fun emojis
  const quickStats = [
    { 
      label: "Portal Status", 
      value: "Active", 
      emoji: "🚀",
      icon: Globe, 
      color: "text-blue-600",
      description: "All systems operational!"
    },
    { 
      label: "System Status", 
      value: "Online", 
      emoji: "✅",
      icon: CheckCircle, 
      color: "text-green-600",
      description: "Running smoothly"
    },
    { 
      label: "Security Level", 
      value: "Maximum", 
      emoji: "🛡️",
      icon: Lock, 
      color: "text-red-600",
      description: "Enterprise-grade security"
    },
    { 
      label: "Permissions", 
      value: permissions?.length || 0, 
      emoji: "🔑",
      icon: Key, 
      color: "text-purple-600",
      description: "Active permissions"
    }
  ];

  // Feature highlights
  const features = [
    {
      emoji: "👥",
      title: "User Management",
      description: "Create, edit, and manage user accounts with role-based access control. Track user activity and manage permissions effortlessly!",
      permissions: ["view all users", "create users", "edit users"],
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      emoji: "📋",
      title: "Task Management",
      description: "Organize tasks, assign team members, track progress, add comments, and manage attachments. Full-featured task management system!",
      permissions: ["view all tasks", "create tasks", "edit tasks", "assign tasks"],
      icon: FileText,
      color: "from-green-500 to-emerald-500"
    },
    {
      emoji: "📧",
      title: "Mail Command Center",
      description: "Send emails, track delivery status, view logs, and monitor email statistics. Comprehensive email management at your fingertips!",
      permissions: ["send emails", "view email logs"],
      icon: Mail,
      color: "from-purple-500 to-pink-500"
    },
    {
      emoji: "🔐",
      title: "Role & Permissions",
      description: "Powerful Laravel Spatie Permissions integration! Assign roles, manage granular permissions, and control access with precision.",
      permissions: ["view roles", "assign roles", "manage permissions"],
      icon: Shield,
      color: "from-orange-500 to-red-500"
    },
    {
      emoji: "🧪",
      title: "Unit Testing",
      description: "Comprehensive unit tests ensuring code quality and reliability! Explore our test suite covering models, services, and business logic!",
      permissions: [],
      icon: TestTube,
      color: "from-violet-500 to-purple-500",
      url: "/portal/tests"
    }
  ];

  // Technology stack
  const techStack = [
    { name: "Frontend", tech: "React + TypeScript", emoji: "⚛️", description: "Modern UI framework" },
    { name: "Backend", tech: "Laravel + PHP", emoji: "🔄", description: "Robust server framework" },
    { name: "Authentication", tech: "Laravel Passport OAuth2", emoji: "🔑", description: "Secure token-based auth" },
    { name: "Permissions", tech: "Spatie Laravel Permission", emoji: "🛡️", description: "Role & permission management" },
    { name: "UI Framework", tech: "Tailwind + shadcn/ui", emoji: "🎨", description: "Beautiful components" },
    { name: "Database", tech: "SQLite / MySQL", emoji: "💾", description: "Reliable data storage" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section with Public User Notice */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <span>👋</span>
              <span>Welcome back, {user?.name || "Explorer"}!</span>
              {isSuperAdmin() && <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">👑 Super Admin</Badge>}
              {isPublicUser() && <Badge variant="secondary">👀 Demo Mode</Badge>}
            </h1>
            <p className="text-lg text-muted-foreground">
              🎉 Your <span className="font-semibold text-purple-600">LaraWorld Portal</span> dashboard - showcasing the power of Laravel with modern React! 
              <span className="ml-2">✨</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
            <Badge variant="secondary" className="text-sm px-3 py-1">
              🚀 Portal Showcase
            </Badge>
          </div>
        </div>

        {/* Public User Notice */}
        {isPublicUser() && (
          <PublicUserNotice />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-lg transition-shadow border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stat.emoji}</span>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Credit System Information - Show fun component for visitors, regular for others */}
      {isVisitor && hasCredits && (
        <VisitorCreditDisplay user={user} />
      )}
      
      {/* Credit System Information for non-visitors */}
      {!isVisitor && (hasCredits || hasUnlimitedCredits) && (
        <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Coins className="h-6 w-6 text-purple-600" />
              <span>🪙 Credit System Overview</span>
            </CardTitle>
            <CardDescription className="text-base">
              🎁 This portal uses a <span className="font-semibold">credit-based system</span> to manage resource usage. 
              {hasUnlimitedCredits 
                ? " As a super admin, you have unlimited credits! 🎉"
                : " Keep track of your credits below! 📊"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasUnlimitedCredits ? (
              <div className="flex items-center justify-center p-8 bg-white rounded-lg border-2 border-yellow-300">
                <div className="text-center space-y-2">
                  <Infinity className="h-12 w-12 text-yellow-500 mx-auto" />
                  <p className="text-2xl font-bold text-gray-900">Unlimited Credits!</p>
                  <p className="text-gray-600">You have unlimited access to all features! 🚀</p>
                </div>
              </div>
            ) : (
              <>
                {/* Credit Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Total Credits</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{totalCredits}</p>
                    <p className="text-xs text-gray-500 mt-1">Across all modules</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">Available</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{totalAvailable}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready to use</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">Used</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{totalUsed}</p>
                    <p className="text-xs text-gray-500 mt-1">Already consumed</p>
                  </div>
                </div>

                {/* Module Credits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(creditStats).map(([module, credit]: [string, any]) => (
                    <div key={module} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {module === 'user' && <Users className="h-5 w-5 text-blue-600" />}
                          {module === 'email' && <Mail className="h-5 w-5 text-purple-600" />}
                          {module === 'task' && <FileText className="h-5 w-5 text-green-600" />}
                          <span className="font-semibold capitalize">{module} Credits</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold">{credit.credits}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Used:</span>
                          <span className="font-bold text-orange-600">{credit.used}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Available:</span>
                          <span className="font-bold text-green-600">{credit.available}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              credit.available > credit.credits * 0.3 
                                ? 'bg-green-500' 
                                : credit.available > 0 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${(credit.available / credit.credits) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">💡 How it works:</span> Each action (creating a user, sending an email, creating a task) consumes credits. 
                    When you run out of credits, contact the admin to get more! 
                    <span className="ml-1">🎯</span>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Credit System Info for Public Users */}
      {isPublicUser() && (
        <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gift className="h-6 w-6 text-orange-600" />
              <span>🎁 Credit System Explained</span>
            </CardTitle>
            <CardDescription className="text-base">
              Curious about how the credit system works? Here's the scoop! 📚
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-bold">How It Works</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>1️⃣</span>
                    <span>Request visitor access from the admin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>2️⃣</span>
                    <span>Admin creates your account with credits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>3️⃣</span>
                    <span>Each action consumes credits (users, emails, tasks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>4️⃣</span>
                    <span>Track your usage and request more when needed!</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-5 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-bold">Credit Modules</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span><strong>User Credits:</strong> Create and manage user accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <span><strong>Email Credits:</strong> Send emails through the system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span><strong>Task Credits:</strong> Create and manage tasks</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border border-purple-300">
              <p className="text-sm text-gray-800 font-medium">
                🚀 <strong>Ready to get started?</strong> Request visitor credentials and the admin will set you up with credits to explore all features! 
                Contact <a href={`mailto:${CONTACT_CONFIG.email}`} className="text-purple-700 underline font-semibold">{CONTACT_CONFIG.email}</a> to get started! 
                <span className="ml-1">✨</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Laravel Permissions Showcase */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="h-6 w-6 text-purple-600" />
            <span>🔐 Laravel Spatie Permissions System</span>
          </CardTitle>
          <CardDescription className="text-base">
            This portal showcases the powerful <span className="font-semibold text-purple-700">Spatie Laravel Permission</span> package! 
            Role-based access control with granular permissions. 🎯
              </CardDescription>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-bold">Role-Based Access</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Three main roles with different permission levels:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">👑 Super Admin</Badge>
                  <span className="text-gray-700">Full access to everything</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">👤 Visitor</Badge>
                  <span className="text-gray-700">Can perform actions with credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="secondary">🌍 Public</Badge>
                  <span className="text-gray-700">View-only access (demo mode)</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold">Granular Permissions</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Fine-grained control over actions:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {permissions && permissions.length > 0 ? (
                  permissions.slice(0, 8).map((perm: string) => (
                    <div key={perm} className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-gray-600 truncate">{perm}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No permissions loaded</p>
                )}
              </div>
              {permissions && permissions.length > 8 && (
                <p className="text-xs text-gray-500 mt-2">
                  +{permissions.length - 8} more permissions...
                </p>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border border-blue-300">
            <p className="text-sm text-gray-800">
              <strong>🎓 Learning Note:</strong> This system uses <span className="font-semibold">Spatie Laravel Permission</span> package, 
              which provides a flexible and powerful way to manage roles and permissions in Laravel applications. 
              Every action is protected by permission checks, ensuring secure access control! 
              <span className="ml-1">🛡️</span>
                </p>
              </div>
            </CardContent>
          </Card>

      {/* Feature Highlights */}
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Rocket className="h-8 w-8 text-purple-600" />
            <span>🚀 Portal Features</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore the amazing features this Laravel showcase portal has to offer! Each module is packed with functionality. 
            <span className="ml-1">✨</span>
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const hasAccess = feature.permissions.some(perm => permissions?.includes(perm));
            return (
              <Card 
                key={index} 
                className={`border-2 hover:shadow-xl transition-all ${
                  hasAccess 
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50' 
                    : 'border-gray-200 bg-gray-50'
                } ${feature.url ? 'cursor-pointer' : ''}`}
                onClick={() => feature.url && navigate(feature.url)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-3xl">{feature.emoji}</span>
                    <span>{feature.title}</span>
                    {hasAccess && (
                      <Badge className="bg-green-600 text-white ml-auto">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <feature.icon className={`h-12 w-12 bg-gradient-to-r ${feature.color} text-white p-3 rounded-lg`} />
                    {!hasAccess && (
                      <Badge variant="outline" className="text-xs">
                        🔒 Restricted
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="h-6 w-6 text-purple-600" />
            <span>🏗️ Technology Stack</span>
          </CardTitle>
          <CardDescription className="text-base">
            Built with modern, industry-leading technologies for optimal performance and developer experience! 
            <span className="ml-1">⚡</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech, index) => (
              <div 
                key={index} 
                className="text-center p-6 border-2 rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <div className="text-4xl mb-2">{tech.emoji}</div>
                <h4 className="font-bold text-lg mb-1">{tech.name}</h4>
                <p className="text-sm font-semibold text-purple-600 mb-1">{tech.tech}</p>
                <p className="text-xs text-muted-foreground">{tech.description}</p>
            </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action for Public Users */}
      {isPublicUser() && (
        <Card className="border-2 border-gradient-to-r from-purple-300 to-pink-300 bg-gradient-to-br from-purple-100 to-pink-100">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900">
              Ready to Explore Full Features?
            </h3>
            <p className="text-lg text-gray-700">
              Request visitor credentials to experience the complete power of this Laravel showcase portal! 
              Get credits and start creating! 
              <span className="ml-1">🚀</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                <a href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}>
                  <Rocket className="h-5 w-5 mr-2" />
                  Request Visitor Access
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortalDashboard;

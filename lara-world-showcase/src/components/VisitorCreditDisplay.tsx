import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  Users, 
  Mail, 
  FileText, 
  TrendingUp, 
  Zap, 
  Gift, 
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull
} from "lucide-react";
import { AuthUser } from "@/services/auth";

interface VisitorCreditDisplayProps {
  user: AuthUser | null;
  compact?: boolean;
}

export const VisitorCreditDisplay = ({ user, compact = false }: VisitorCreditDisplayProps) => {
  if (!user) return null;

  const creditStats = user.credits || {};
  const hasCredits = Object.keys(creditStats).length > 0;

  if (!hasCredits) return null;

  // Module configurations with fun emojis and descriptions
  const moduleConfigs = {
    user: {
      emoji: "👥",
      icon: Users,
      name: "User Credits",
      borderColor: "border-blue-300",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Create awesome users!",
      funMessage: (available: number, total: number) => {
        if (available === 0) return "😱 No more user creation power! Time to ask the admin for a refill!";
        if (available <= total * 0.2) return "⚠️ Running low on user juice! Better use them wisely!";
        if (available <= total * 0.5) return "💪 Still got some user creation mojo left!";
        return "🎉 Plenty of user creation power in the tank!";
      }
    },
    email: {
      emoji: "📧",
      icon: Mail,
      name: "Email Credits",
      borderColor: "border-purple-300",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Send those emails!",
      funMessage: (available: number, total: number) => {
        if (available === 0) return "📭 Email inbox is empty! No more sending power!";
        if (available <= total * 0.2) return "📬 Almost out of email magic! Use wisely!";
        if (available <= total * 0.5) return "📮 Still got some email sending juice!";
        return "📨 Loads of email sending power ready to go!";
      }
    },
    task: {
      emoji: "📋",
      icon: FileText,
      name: "Task Credits",
      borderColor: "border-green-300",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Create epic tasks!",
      funMessage: (available: number, total: number) => {
        if (available === 0) return "📝 Task creation powers depleted! Time for a credit refill!";
        if (available <= total * 0.2) return "📌 Task credits running low! Make them count!";
        if (available <= total * 0.5) return "✅ Still got task creation energy!";
        return "🎯 Task creation powers at full strength!";
      }
    }
  };

  // Calculate totals
  const totalCredits = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.credits || 0), 0);
  const totalUsed = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.used || 0), 0);
  const totalAvailable = Object.values(creditStats).reduce((sum: number, credit: any) => sum + (credit.available || 0), 0);
  const totalUsagePercent = totalCredits > 0 ? (totalUsed / totalCredits) * 100 : 0;

  // Get battery icon based on available credits
  const getBatteryIcon = (available: number, total: number) => {
    if (total === 0) return Battery;
    const percent = (available / total) * 100;
    if (percent === 0) return BatteryLow;
    if (percent <= 25) return BatteryLow;
    if (percent <= 50) return BatteryMedium;
    if (percent <= 75) return BatteryMedium;
    return BatteryFull;
  };

  // Get overall status message
  const getOverallStatus = () => {
    if (totalAvailable === 0) return { emoji: "😱", message: "All credits exhausted! Time to contact the admin for a refill!", color: "text-red-600" };
    if (totalUsagePercent >= 90) return { emoji: "⚠️", message: "Running dangerously low on credits! Better use them wisely!", color: "text-orange-600" };
    if (totalUsagePercent >= 70) return { emoji: "💡", message: "Credits are getting low, but you still have some power left!", color: "text-yellow-600" };
    if (totalUsagePercent >= 50) return { emoji: "💪", message: "Halfway through your credits! Still plenty of action left!", color: "text-blue-600" };
    if (totalUsagePercent >= 25) return { emoji: "🎉", message: "Lots of credits remaining! You're doing great!", color: "text-green-600" };
    return { emoji: "🚀", message: "Credit power at maximum! Ready for action!", color: "text-green-600" };
  };

  const overallStatus = getOverallStatus();
  
  // Get the battery icon component
  const BatteryIcon = getBatteryIcon(totalAvailable, totalCredits);

  if (compact) {
    return (
      <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200 bg-gradient-to-br from-purple-50 to-blue-50 w-full max-w-full overflow-hidden">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Coins className="h-4 w-4 text-purple-600" />
            <span className="text-sm">🪙 Credit Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xl">{overallStatus.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate">Available</p>
                  <p className="text-xl font-bold text-purple-600">{totalAvailable}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground whitespace-nowrap">Used: {totalUsed}/{totalCredits}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all ${
                  totalUsagePercent >= 90 ? 'bg-red-500' :
                  totalUsagePercent >= 70 ? 'bg-orange-500' :
                  totalUsagePercent >= 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, 100 - totalUsagePercent))}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gradient-to-r from-purple-300 to-blue-300 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Coins className="h-6 w-6 text-purple-600 animate-pulse" />
          <span>🪙 Your Credit Power Dashboard</span>
          <Sparkles className="h-5 w-5 text-yellow-500" />
        </CardTitle>
        <CardDescription className="text-base">
          <span className="font-semibold">💰 Credit System Status:</span> Track your total and used credits across all modules! 
          Each action you take consumes credits, so keep an eye on your balance! 
          <span className="ml-1">✨</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className={`p-4 rounded-xl border-2 ${
          totalUsagePercent >= 90 ? 'border-red-300 bg-red-50' :
          totalUsagePercent >= 70 ? 'border-orange-300 bg-orange-50' :
          totalUsagePercent >= 50 ? 'border-yellow-300 bg-yellow-50' :
          'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{overallStatus.emoji}</span>
              <div>
                <p className={`text-lg font-bold ${overallStatus.color}`}>
                  {overallStatus.message}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  You've used {totalUsed} out of {totalCredits} total credits ({Math.round(totalUsagePercent)}% used)
                </p>
              </div>
            </div>
            <BatteryIcon 
              className={`h-12 w-12 ${
                totalUsagePercent >= 90 ? 'text-red-600' :
                totalUsagePercent >= 70 ? 'text-orange-600' :
                totalUsagePercent >= 50 ? 'text-yellow-600' :
                'text-green-600'
              }`}
            />
          </div>
        </div>

        {/* Overall Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl border-2 border-blue-300">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-blue-700" />
              <span className="text-sm font-bold text-blue-900">🎁 Total Credits</span>
            </div>
            <p className="text-3xl font-bold text-blue-700">{totalCredits}</p>
            <p className="text-xs text-blue-600 mt-1">Across all modules</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl border-2 border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-700" />
              <span className="text-sm font-bold text-green-900">✅ Available</span>
            </div>
            <p className="text-3xl font-bold text-green-700">{totalAvailable}</p>
            <p className="text-xs text-green-600 mt-1">Ready to use!</p>
          </div>
          <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-xl border-2 border-orange-300">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-orange-700" />
              <span className="text-sm font-bold text-orange-900">⚡ Used</span>
            </div>
            <p className="text-3xl font-bold text-orange-700">{totalUsed}</p>
            <p className="text-xs text-orange-600 mt-1">Already consumed</p>
          </div>
        </div>

        {/* Module-Specific Credits */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>📊</span>
            <span>Module Credit Breakdown</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(creditStats).map(([module, credit]: [string, any]) => {
              const config = moduleConfigs[module as keyof typeof moduleConfigs];
              if (!config) return null;

              const Icon = config.icon;
              const usagePercent = credit.credits > 0 ? (credit.used / credit.credits) * 100 : 0;
              const availablePercent = credit.credits > 0 ? (credit.available / credit.credits) * 100 : 0;
              const funMsg = config.funMessage(credit.available, credit.credits);

              return (
                <div 
                  key={module}
                  className={`p-5 rounded-xl border-2 ${
                    availablePercent === 0 ? 'border-red-300 bg-red-50' :
                    availablePercent <= 20 ? 'border-orange-300 bg-orange-50' :
                    availablePercent <= 50 ? 'border-yellow-300 bg-yellow-50' :
                    `${config.borderColor} ${config.bgColor}`
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{config.emoji}</span>
                      <Icon className={`h-6 w-6 ${config.iconColor}`} />
                    </div>
                    <Badge 
                      variant={availablePercent === 0 ? "destructive" : availablePercent <= 20 ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {availablePercent === 0 ? "😱 Empty" : availablePercent <= 20 ? "⚠️ Low" : availablePercent <= 50 ? "💪 OK" : "🎉 Great"}
                    </Badge>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2 capitalize">{config.name}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{config.description}</p>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">🎁 Total:</span>
                      <span className="font-bold text-gray-900">{credit.credits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">⚡ Used:</span>
                      <span className="font-bold text-orange-600">{credit.used}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">✅ Available:</span>
                      <span className="font-bold text-green-600">{credit.available}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div 
                      className={`h-3 rounded-full transition-all ${
                        availablePercent === 0 ? 'bg-red-500' :
                        availablePercent <= 20 ? 'bg-orange-500' :
                        availablePercent <= 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${availablePercent}%` }}
                    />
                  </div>

                  <p className="text-xs font-medium text-gray-700 italic mt-3 p-2 bg-white rounded border border-gray-200">
                    {funMsg}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fun Footer Message */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-300">
          <p className="text-sm text-gray-800 text-center">
            <span className="font-bold">💡 Pro Tip:</span> Each action (creating users, sending emails, creating tasks) consumes 1 credit. 
            When you run out, just contact the admin for a refill! They're super friendly! 
            <span className="ml-1">😊✨</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


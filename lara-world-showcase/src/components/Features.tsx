import { Shield, Zap, Bell, Mail, Database, GitBranch, Users, FileText, Coins, Key, Lock, Rocket, TestTube } from "lucide-react";

const features = [
  {
    icon: Shield,
    emoji: "🔐",
    title: "Laravel Spatie Permissions",
    description: "Powerful role-based access control with granular permissions! Experience three distinct roles (Super Admin, Visitor, Public) with fine-grained permission management. Perfect showcase of enterprise-level security! 🛡️",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200"
  },
  {
    icon: Coins,
    emoji: "🪙",
    title: "Credit-Based System",
    description: "Smart resource management with a credit system! Track usage across modules (users, emails, tasks), monitor consumption, and manage access efficiently. Super admins get unlimited credits! 🎯",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-yellow-50",
    borderColor: "border-orange-200"
  },
  {
    icon: Key,
    emoji: "🔑",
    title: "OAuth2 Authentication",
    description: "Secure OAuth2 implementation with Laravel Passport! Password-based authentication with Personal Access Tokens, token-based API access, and seamless SPA integration. Enterprise-grade security made simple! 🚀",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200"
  },
  {
    icon: Database,
    emoji: "🗄️",
    title: "RESTful APIs",
    description: "Well-structured API endpoints following REST conventions! Clean architecture, proper validation, API resources, and comprehensive error handling. Production-ready API design! 🌐",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Users,
    emoji: "👥",
    title: "User Management",
    description: "Complete user management system with role assignment, permission management, and user statistics! Create, edit, delete users with full CRUD operations and permission checks! ✨",
    color: "from-indigo-500 to-blue-500",
    bgColor: "from-indigo-50 to-blue-50",
    borderColor: "border-indigo-200"
  },
  {
    icon: FileText,
    emoji: "📋",
    title: "Task Management",
    description: "Full-featured task management system! Create tasks, assign team members, track progress, add comments, manage attachments, and monitor task statistics. Everything you need! 📊",
    color: "from-teal-500 to-green-500",
    bgColor: "from-teal-50 to-green-50",
    borderColor: "border-teal-200"
  },
  {
    icon: Mail,
    emoji: "📧",
    title: "Mail Command Center",
    description: "Comprehensive email management system! Send emails, track delivery status, view detailed logs, monitor statistics, and manage email templates. Full email workflow management! 📨",
    color: "from-pink-500 to-rose-500",
    bgColor: "from-pink-50 to-rose-50",
    borderColor: "border-pink-200"
  },
  {
    icon: Zap,
    emoji: "⚡",
    title: "Jobs & Queues",
    description: "Asynchronous task processing with Laravel Queue system! Background jobs, queue workers, and efficient task processing. Handle heavy operations without blocking user experience! 🚀",
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200"
  },
  {
    icon: Bell,
    emoji: "🔔",
    title: "Real-Time Notifications",
    description: "Database and broadcast notifications for instant updates! Real-time notifications, event broadcasting, and seamless user experience. Stay updated with instant alerts! 📢",
    color: "from-cyan-500 to-blue-500",
    bgColor: "from-cyan-50 to-blue-50",
    borderColor: "border-cyan-200"
  },
  {
    icon: Lock,
    emoji: "🛡️",
    title: "Security & Policies",
    description: "Enterprise-level security with Laravel Policies, Gates, and Middleware! Role-based authorization, permission checks, and secure access control throughout the application! 🔒",
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50",
    borderColor: "border-red-200"
  },
  {
    icon: GitBranch,
    emoji: "🚀",
    title: "DevOps Ready",
    description: "Containerized deployment with Docker! Multi-stage builds, Docker Compose orchestration, automated testing, and production-ready deployment setup. Built for scalability and reliability! 🐳",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200"
  },
  {
    icon: Rocket,
    emoji: "🌟",
    title: "Production Ready",
    description: "Built with production considerations in mind! Error handling, logging, monitoring, testing, and best practices throughout. Ready for real-world deployment! ✨",
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50",
    borderColor: "border-amber-200"
  },
  {
    icon: TestTube,
    emoji: "🧪",
    title: "Comprehensive Unit Testing",
    description: "71+ unit tests covering models, services, relationships, and business logic! High code coverage (88%+), comprehensive test suites, and reliable test execution. Quality assurance at its finest! 🎯",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50",
    borderColor: "border-violet-200"
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 border-2 border-purple-300">
            <Rocket className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span>✨</span>
            <span>Features & Capabilities</span>
            <span>🚀</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the <span className="font-semibold text-purple-600">production-level features</span> implemented in this demo portal! 
            Each feature is carefully crafted to showcase real-world development skills! 
            <span className="ml-1">🎉</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group p-6 rounded-2xl bg-gradient-to-br ${feature.bgColor} border-2 ${feature.borderColor} hover:shadow-xl transition-all duration-300 animate-fade-in hover:scale-105`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white text-3xl group-hover:scale-110 transition-transform shadow-lg`}>
                  {feature.emoji}
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
          <p className="text-lg text-gray-800 font-semibold mb-2">
            🎯 Want to see these features in action?
          </p>
          <p className="text-base text-gray-700">
            Enter the demo portal to explore all these amazing features! 
            Use public credentials for view-only access, or request visitor credentials for full experience! 
            <span className="ml-1">✨</span>
          </p>
        </div>
      </div>
    </section>
  );
};

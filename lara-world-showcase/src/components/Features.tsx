import { Shield, Zap, Bell, Mail, Database, GitBranch, Users, FileText, Coins, Key, Lock, Rocket, TestTube } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="features" className="section-shell bg-gradient-subtle py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-glow backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
          <h2 className="flex flex-wrap items-center justify-center gap-3 text-4xl font-bold text-foreground md:text-5xl">
            <span>✨</span>
            <span>Features & Capabilities</span>
            <span>🚀</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-xl text-muted-foreground">
            Explore the <span className="font-semibold text-primary">production-level features</span> implemented in this demo portal! 
            Each feature is carefully crafted to showcase real-world development skills! 
            <span className="ml-1">🎉</span>
          </p>
        </div>

        <div className="card-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.04, duration: 0.4, type: "spring", stiffness: 120, damping: 18 }}
              className="group rounded-2xl border border-border/70 bg-white/80 p-6 shadow-sm backdrop-blur-md transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated dark:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-2xl text-white shadow-lg ring-4 ring-white/50 transition duration-300 group-hover:scale-110 dark:ring-white/10`}>
                  {feature.emoji}
                </div>
                <div className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-sm">
                  <feature.icon className="mr-2 inline-block h-4 w-4 text-primary/80" />
                  {feature.title.split(" ")[0]}
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14">
          <div className="glass-panel text-center rounded-2xl px-10 py-8">
            <p className="text-lg font-semibold text-foreground mb-2">
              🎯 Want to see these features in action?
            </p>
            <p className="text-base text-muted-foreground">
              Enter the demo portal to explore all these amazing features! 
              Use public credentials for view-only access, or request visitor credentials for full experience! 
              <span className="ml-1">✨</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

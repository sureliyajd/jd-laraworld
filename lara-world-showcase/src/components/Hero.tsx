import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Sparkles, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { CONTACT_CONFIG } from "@/config/contact";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
            <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm font-bold text-purple-800">🚀 Full-Stack Development Showcase</span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight flex items-center justify-center gap-3 flex-wrap">
            <span>👋</span>
            <span>Welcome to</span>
            <span className="bg-gradient-hero bg-clip-text text-transparent">Jd's LaraWorld</span>
            <span>✨</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            🎉 A <span className="font-bold text-purple-600">live showcase</span> of my Laravel + React full-stack skills! 
            Explore production-ready features, <span className="font-semibold">role-based permissions</span>, 
            <span className="font-semibold"> credit system</span>, and so much more! 
            <span className="ml-1">🚀</span>
          </p>

          {/* Key Highlights */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-300">
              <span>🔐</span>
              <span className="text-sm font-semibold text-green-800">Laravel Spatie Permissions</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-300">
              <span>🪙</span>
              <span className="text-sm font-semibold text-blue-800">Credit-Based System</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-300">
              <span>🔑</span>
              <span className="text-sm font-semibold text-purple-800">OAuth2 Authentication</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-300">
              <span>⚡</span>
              <span className="text-sm font-semibold text-orange-800">Real-Time Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-300">
              <span>🧪</span>
              <span className="text-sm font-semibold text-violet-800">Unit Testing</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button asChild variant="hero" size="lg" className="text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
              <Link to="/portal/login" className="inline-flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span>Enter Demo Portal</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base border-2">
              <a href="#features" className="inline-flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>Explore Features</span>
              </a>
            </Button>
          </div>

          {/* Quick Info Box */}
          <div className="max-w-2xl mx-auto mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <p className="text-sm text-gray-800 leading-relaxed">
              <span className="font-bold">🎭 Demo Credentials Available!</span> You can explore the portal with public demo credentials (view-only mode), 
              or <a 
                href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
                className="font-semibold text-purple-700 hover:text-purple-900 underline cursor-pointer transition-colors"
              >
                request visitor access
              </a> to experience the full power with credits! 
              <span className="ml-1">✨</span>
            </p>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-8">
            <div className="w-full mb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3">🏗️ Built with these awesome technologies:</p>
            </div>
            {[
              { tech: "Laravel 12", emoji: "🔄" },
              { tech: "React 18", emoji: "⚛️" },
              { tech: "TypeScript 5.8", emoji: "📘" },
              { tech: "Vite 5", emoji: "⚡" },
              { tech: "Tailwind CSS 3.4", emoji: "🎨" },
              { tech: "SQLite/MySQL", emoji: "💾" },
              { tech: "Eloquent ORM", emoji: "🗄️" },
              { tech: "RESTful APIs", emoji: "🌐" },
              { tech: "Laravel Passport", emoji: "🔑" },
              { tech: "OAuth2 Authentication", emoji: "🛡️" },
              { tech: "Spatie Permissions", emoji: "🔐" },
              { tech: "Jobs & Queues", emoji: "⚙️" },
              { tech: "Events & Listeners", emoji: "📢" },
              { tech: "Real-Time Broadcasting", emoji: "📡" },
              { tech: "Notifications", emoji: "🔔" },
              { tech: "Mailables", emoji: "📧" },
              { tech: "File Storage", emoji: "📁" },
              { tech: "AWS S3 Integration", emoji: "☁️" },
              { tech: "Docker", emoji: "🐳" },
              { tech: "CI/CD", emoji: "🚀" },
              { tech: "Unit Testing", emoji: "🧪" },
              { tech: "Feature Testing", emoji: "✅" },
              { tech: "Production Ready", emoji: "🌟" }
            ].map((item) => (
              <span key={item.tech} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border-2 border-border hover:border-primary/50 text-sm font-medium text-foreground transition-colors">
                <span>{item.emoji}</span>
                <span>{item.tech}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

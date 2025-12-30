import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CONTACT_CONFIG } from "@/config/contact";

export const Hero = () => {
  const scrollToFeatures = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const featuresElement = document.getElementById('features');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="section-shell relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-10 mx-auto h-[420px] w-[720px] bg-gradient-hero opacity-30 blur-3xl" />
        <div className="absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[12%] bottom-[8%] h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="mx-auto max-w-5xl space-y-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-5 py-2 shadow-glow backdrop-blur-md dark:border-white/10 dark:bg-white/5"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">🚀 Full-Stack Development Showcase</span>
            <Star className="h-4 w-4 text-amber-500" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.05, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-3 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          >
            <span>👋</span>
            <span>Welcome to</span>
            <span className="bg-gradient-hero bg-clip-text text-transparent drop-shadow-sm">Jd's LaraWorld</span>
            <span>✨</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            🎉 A <span className="font-semibold text-primary">live showcase</span> of my Laravel + React full-stack skills! 
            Explore production-ready features, <span className="font-semibold">role-based permissions</span>, 
            <span className="font-semibold"> credit system</span>, and so much more! 
            <span className="ml-1">🚀</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 pt-4"
          >
            {[
              { label: "Laravel Spatie Permissions", tone: "from-green-100/70 to-emerald-50/90", text: "text-emerald-900", emoji: "🔐" },
              { label: "Credit-Based System", tone: "from-blue-100/70 to-indigo-50/90", text: "text-indigo-900", emoji: "🪙" },
              { label: "OAuth2 Authentication", tone: "from-purple-100/70 to-pink-50/90", text: "text-purple-900", emoji: "🔑" },
              { label: "Real-Time Updates", tone: "from-amber-100/70 to-orange-50/90", text: "text-amber-900", emoji: "⚡" },
              { label: "Unit Testing", tone: "from-violet-100/70 to-slate-50/90", text: "text-violet-900", emoji: "🧪" },
            ].map((chip) => (
              <span
                key={chip.label}
                className={`inline-flex items-center gap-2 rounded-full border border-white/70 bg-gradient-to-r ${chip.tone} px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur-sm dark:border-white/10`}
              >
                <span>{chip.emoji}</span>
                <span className={chip.text}>{chip.label}</span>
              </span>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row"
          >
            <Button asChild variant="hero" size="lg" className="text-base shadow-glow hover:shadow-elevated">
              <Link to="/portal/login" className="inline-flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                <span>Enter Demo Portal</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base border-2 hover:border-primary/50 hover:shadow-sm"
              onClick={scrollToFeatures}
            >
              <Zap className="h-5 w-5" />
              <span>Explore Features</span>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25, duration: 0.6 }}
            className="glass-panel mx-auto mt-10 max-w-2xl rounded-2xl px-7 py-6 text-left shadow-elevated"
          >
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold text-primary">🎭 Demo Credentials Available!</span> You can explore the portal with public demo credentials (view-only mode), 
              or <a 
                href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
                className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary/80"
              >
                request visitor access
              </a> to experience the full power with credits! 
              <span className="ml-1">✨</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pt-10"
          >
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">🏗️ Built with these awesome technologies:</p>
            <div className="flex flex-wrap justify-center gap-3">
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
                <span 
                  key={item.tech} 
                  className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-white/70 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-glow backdrop-blur-sm dark:bg-white/10"
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span>{item.tech}</span>
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

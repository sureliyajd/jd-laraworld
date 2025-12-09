import { User, Rocket, Sparkles, Shield, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { CONTACT_CONFIG } from "@/config/contact";

export const About = () => {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-glow backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="flex items-center justify-center gap-3 text-4xl font-bold text-foreground md:text-5xl">
            <span>👋</span>
            <span>About This Project</span>
            <span>🚀</span>
          </h2>
          <p className="mt-3 text-xl text-muted-foreground">
            Get to know what makes this showcase special! 
            <span className="ml-1">✨</span>
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-60px" }} 
            className="glass-panel text-center rounded-2xl px-8 py-8"
          >
            <p className="mb-4 text-lg leading-relaxed text-foreground">
              Hey there! I'm <span className="text-xl font-bold text-primary">Jaydeep Sureliya</span>, 
              a full-stack developer passionate about Laravel, React, and DevOps! 
              <span className="ml-1">🎉</span>
            </p>
            <p className="text-base text-muted-foreground">
              This <span className="font-semibold">LaraWorld showcase</span> is my way of demonstrating 
              production-ready development skills through a live, interactive portal! 
              <span className="ml-1">🌟</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-60px" }} 
            className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm backdrop-blur-md dark:bg-card/60"
          >
            <div className="mb-4 flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">🎯 Project Purpose</h3>
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This showcase is designed to demonstrate my expertise in building 
              <span className="font-semibold text-primary"> production-ready full-stack applications</span>. 
              It serves as a comprehensive portfolio piece showcasing real-world development skills, 
              architectural decisions, and modern development practices! 
              <span className="ml-1">💪</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-60px" }} 
            className="rounded-2xl border border-border/80 bg-card/70 p-6 shadow-sm backdrop-blur-md dark:bg-card/60"
          >
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">✨ What's Included in This Demo</h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 p-5 backdrop-blur-sm dark:border-white/10 dark:from-white/5 dark:to-white/0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">🔄</span>
                  <h4 className="text-lg font-bold text-foreground">Backend Features (Laravel)</h4>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span>RESTful API with proper authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔑</span>
                    <span>OAuth2 with Laravel Passport</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔐</span>
                    <span><strong>Spatie Laravel Permissions</strong> - Role-based access control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📋</span>
                    <span>Task management system with CRUD operations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📁</span>
                    <span>File upload and attachment handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>👥</span>
                    <span>User management and role-based access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🪙</span>
                    <span><strong>Credit system</strong> - Manage resource usage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🗄️</span>
                    <span>Database relationships and migrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📦</span>
                    <span>API resource transformations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🧪</span>
                    <span><strong>Comprehensive Unit Testing</strong> - 71+ tests with 88%+ coverage</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4 rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-5 backdrop-blur-sm dark:border-white/10 dark:from-white/5 dark:to-white/0">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚛️</span>
                  <h4 className="text-lg font-bold text-foreground">Frontend Features (React + TypeScript)</h4>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span>⚛️</span>
                    <span>Modern React with TypeScript</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎨</span>
                    <span>Responsive design with Tailwind CSS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🔄</span>
                    <span>State management and API integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>📤</span>
                    <span>File upload with progress tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>⚡</span>
                    <span>Real-time UI updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span>Form validation and error handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🧩</span>
                    <span>Component-based architecture</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎭</span>
                    <span>Permission-based UI rendering</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🪙</span>
                    <span>Credit system dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-60px" }} 
              className="rounded-2xl border border-green-200/70 bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:from-white/5 dark:to-white/0"
            >
              <div className="mb-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-emerald-600" />
                <h4 className="text-xl font-bold text-foreground">🔐 Laravel Permissions System</h4>
              </div>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                This showcase features the powerful <span className="font-bold text-emerald-700">Spatie Laravel Permission</span> package! 
                Experience role-based access control with three distinct roles:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span>👑</span>
                  <span><strong>Super Admin:</strong> Full access to everything</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>👤</span>
                  <span><strong>Visitor:</strong> Can perform actions with credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🌍</span>
                  <span><strong>Public:</strong> View-only access (demo mode)</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 16 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-60px" }} 
              className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50/80 to-yellow-50/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:from-white/5 dark:to-white/0"
            >
              <div className="mb-4 flex items-center gap-3">
                <Coins className="h-6 w-6 text-amber-600" />
                <h4 className="text-xl font-bold text-foreground">🪙 Credit-Based System</h4>
              </div>
              <p className="mb-3 text-base leading-relaxed text-muted-foreground">
                This portal uses a <span className="font-bold text-amber-700">credit-based system</span> to manage resource usage! 
                Here's how it works:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span>1️⃣</span>
                  <span>Request visitor access from admin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2️⃣</span>
                  <span>Admin creates account with credits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3️⃣</span>
                  <span>Each action consumes credits (users, emails, tasks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>4️⃣</span>
                  <span>Track usage and request more when needed!</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-60px" }} 
            className="rounded-2xl border border-purple-200/70 bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:from-white/5 dark:via-white/5 dark:to-white/0"
          >
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
              <span>🎓</span>
              <span>Technical Highlights</span>
            </h3>
            <p className="text-lg leading-relaxed text-muted-foreground">
              This project demonstrates proficiency in modern web development including API design, authentication flows, 
              file handling, responsive UI design, <span className="font-semibold">permission management</span>, 
              <span className="font-semibold"> credit systems</span>, <span className="font-semibold">comprehensive unit testing</span>, 
              and clean code architecture. 
              It's built with production considerations in mind, showcasing both technical skills and attention to user experience! 
              <span className="ml-1">🚀</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-60px" }} 
            className="text-center rounded-2xl bg-gradient-hero px-8 py-10 text-white shadow-glow"
          >
            <p className="mb-4 text-xl font-bold">
              🎉 Ready to explore? 
            </p>
            <p className="mb-6 text-lg">
              Enter the demo portal to see all these features in action! 
              <span className="ml-1">✨</span>
            </p>
            <a 
              href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
              className="inline-block rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-slate-100"
            >
              💌 Request Visitor Access
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

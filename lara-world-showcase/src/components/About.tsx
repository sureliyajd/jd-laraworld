import { User, Rocket, Sparkles, Shield, Coins } from "lucide-react";
import { CONTACT_CONFIG } from "@/config/contact";

export const About = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 mb-6 border-2 border-purple-300">
            <User className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <span>👋</span>
            <span>About This Project</span>
            <span>🚀</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Get to know what makes this showcase special! 
            <span className="ml-1">✨</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12 animate-fade-in">
            {/* Introduction */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <p className="text-lg text-foreground leading-relaxed mb-4">
                Hey there! I'm <span className="font-bold text-purple-600 text-xl">Jaydeep Sureliya</span>, 
                a full-stack developer passionate about Laravel, React, and DevOps! 
                <span className="ml-1">🎉</span>
              </p>
              <p className="text-base text-muted-foreground">
                This <span className="font-semibold">LaraWorld showcase</span> is my way of demonstrating 
                production-ready development skills through a live, interactive portal! 
                <span className="ml-1">🌟</span>
              </p>
            </div>

            {/* Project Purpose */}
            <div className="p-6 rounded-xl bg-card border-2 border-border">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-6 w-6 text-purple-600" />
                <h3 className="text-2xl font-bold text-foreground">🎯 Project Purpose</h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This showcase is designed to demonstrate my expertise in building 
                <span className="font-semibold text-purple-600"> production-ready full-stack applications</span>. 
                It serves as a comprehensive portfolio piece showcasing real-world development skills, 
                architectural decisions, and modern development practices! 
                <span className="ml-1">💪</span>
              </p>
            </div>

            {/* Key Features */}
            <div className="p-6 rounded-xl bg-card border-2 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-foreground">✨ What's Included in This Demo</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Backend Features */}
                <div className="space-y-4 p-5 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
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
                  </ul>
                </div>

                {/* Frontend Features */}
                <div className="space-y-4 p-5 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
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
            </div>

            {/* Special Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Permissions System */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                  <h4 className="text-xl font-bold text-foreground">🔐 Laravel Permissions System</h4>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-3">
                  This showcase features the powerful <span className="font-bold text-green-700">Spatie Laravel Permission</span> package! 
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
              </div>

              {/* Credit System */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="h-6 w-6 text-orange-600" />
                  <h4 className="text-xl font-bold text-foreground">🪙 Credit-Based System</h4>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed mb-3">
                  This portal uses a <span className="font-bold text-orange-700">credit-based system</span> to manage resource usage! 
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
              </div>
            </div>

            {/* Technical Highlights */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span>🎓</span>
                <span>Technical Highlights</span>
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This project demonstrates proficiency in modern web development including API design, authentication flows, 
                file handling, responsive UI design, <span className="font-semibold">permission management</span>, 
                <span className="font-semibold"> credit systems</span>, and clean code architecture. 
                It's built with production considerations in mind, showcasing both technical skills and attention to user experience! 
                <span className="ml-1">🚀</span>
              </p>
            </div>

            {/* Call to Action */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <p className="text-xl font-bold mb-4">
                🎉 Ready to explore? 
              </p>
              <p className="text-lg mb-6">
                Enter the demo portal to see all these features in action! 
                <span className="ml-1">✨</span>
              </p>
              <a 
                href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
                className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                💌 Request Visitor Access
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

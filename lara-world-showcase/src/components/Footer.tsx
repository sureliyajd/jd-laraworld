import { Github, Linkedin, Mail, Heart, Rocket } from "lucide-react";
import { CONTACT_CONFIG } from "@/config/contact";

export const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-card border-t-2 border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Name and copyright */}
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <span>👋</span>
              <span>Jaydeep Sureliya</span>
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <span>💻</span>
              <span>Full-Stack Developer</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Built with <Heart className="inline h-3 w-3 text-red-500 animate-pulse" /> and lots of 
              <span className="mx-1">☕</span>
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sureliyajd"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary hover:bg-purple-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="GitHub Profile"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/jd-sureliya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-secondary hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Hello from LaraWorld Portal')}`}
              className="w-12 h-12 rounded-full bg-secondary hover:bg-green-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg"
              aria-label="Email Contact"
              title="Send Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright and CTA */}
          <div className="text-center md:text-right space-y-2">
            <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-end gap-1">
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <span>Jd's LaraWorld</span>
              <span>✨</span>
            </p>
            <a
              href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Rocket className="h-4 w-4" />
              <span>Request Visitor Access</span>
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              🎉 This is a live showcase of Laravel + React full-stack development skills
            </p>
            <p className="text-xs text-muted-foreground">
              Features: <span className="font-semibold">Laravel Spatie Permissions</span> • 
              <span className="font-semibold"> Credit System</span> • 
              <span className="font-semibold"> OAuth2 Authentication</span> • 
              <span className="font-semibold"> Real-Time Updates</span>
            </p>
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Use demo credentials for view-only access, or request visitor credentials for full experience!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

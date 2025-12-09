import { Github, Linkedin, Mail, Heart, Rocket } from "lucide-react";
import { CONTACT_CONFIG } from "@/config/contact";

export const Footer = () => {
  return (
    <footer className="border-t border-border/70 bg-card/70 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-lg font-bold text-foreground">
              <span>👋</span>
              <span>Jaydeep Sureliya</span>
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>💻</span>
              <span>Full-Stack Developer</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Built with <Heart className="inline h-3 w-3 text-red-500 animate-pulse" /> and lots of 
              <span className="mx-1">☕</span>
            </p>
            <div className="rounded-xl border border-border/70 bg-white/70 px-4 py-3 text-xs text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-white/5">
              “Design proudly crafted with AI • Every feature, API integration, and functionality built 100% by me”
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Connect</p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/sureliyajd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary shadow-sm"
                aria-label="GitHub Profile"
                title="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/jd-sureliya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary shadow-sm"
                aria-label="LinkedIn Profile"
                title="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Hello from LaraWorld Portal')}`}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary text-foreground transition hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary shadow-sm"
                aria-label="Email Contact"
                title="Send Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-3 text-left md:text-right">
            <p className="flex items-center justify-start gap-1 text-sm text-muted-foreground md:justify-end">
              <span>©</span>
              <span>{new Date().getFullYear()}</span>
              <span>Jd's LaraWorld</span>
              <span>✨</span>
            </p>
            <a
              href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent('Visitor Credentials Request - LaraWorld Portal')}&body=${encodeURIComponent(`Hi ${CONTACT_CONFIG.name},\n\nI'm interested in exploring the full features of your Laravel showcase portal. Could you please provide me with visitor credentials?\n\nThank you!`)}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              <Rocket className="h-4 w-4" />
              <span>Request Visitor Access</span>
            </a>
            <div className="rounded-xl border border-border/70 bg-white/70 px-4 py-3 text-xs text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-white/5">
              🎉 This is a live showcase of Laravel + React full-stack development skills. Features: <span className="font-semibold">Laravel Spatie Permissions</span> • <span className="font-semibold">Credit System</span> • <span className="font-semibold">OAuth2 Authentication</span> • <span className="font-semibold">Real-Time Updates</span>
              <br />
              💡 <strong>Tip:</strong> Use demo credentials for view-only access, or request visitor credentials for full experience!
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

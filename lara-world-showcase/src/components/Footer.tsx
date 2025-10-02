import { Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Name and copyright */}
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold text-foreground mb-1">Jaydeep Sureliya</p>
            <p className="text-sm text-muted-foreground">Full-Stack Developer</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/jaydeepsureliya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://linkedin.com/in/jaydeepsureliya"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:jaydeep@example.com"
              className="w-10 h-10 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-all duration-300"
              aria-label="Email Contact"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Jd's LaraWorld
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

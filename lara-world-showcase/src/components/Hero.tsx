import { Button } from "@/components/ui/button";
import { ArrowRight, Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Full-Stack Development Showcase</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            Jd's <span className="bg-gradient-hero bg-clip-text text-transparent">LaraWorld</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A live showcase of my Laravel + React full-stack skills
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button asChild variant="hero" size="lg" className="text-base">
              <Link to="/portal/login">
                Enter Demo Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Tech stack badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-8">
            {["Laravel", "React", "MySQL", "Passport", "Vite"].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-lg bg-card border border-border text-sm font-medium text-foreground">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

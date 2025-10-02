import { User, Code, Laptop } from "lucide-react";

export const About = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About This Project</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="space-y-6 animate-fade-in">
            <p className="text-lg text-foreground leading-relaxed">
              I'm <span className="font-semibold text-primary">Jaydeep Sureliya</span>, a full-stack developer passionate about Laravel, React, and DevOps.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This project is built to demonstrate production-level features in authentication, APIs, jobs, queues, and more. It serves as both a portfolio piece and a hands-on demonstration of modern full-stack development practices.
            </p>
          </div>

          {/* Visual elements */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated">
              <Code className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Clean Code</h3>
              <p className="text-muted-foreground">Following industry best practices and modern architectural patterns</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated">
              <Laptop className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Production Ready</h3>
              <p className="text-muted-foreground">Built with scalability and real-world deployment in mind</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

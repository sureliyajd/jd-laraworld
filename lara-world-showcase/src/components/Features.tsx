import { Shield, Zap, Bell, Mail, Database, GitBranch } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Authentication with Passport",
    description: "Secure OAuth2 implementation with token-based authentication",
  },
  {
    icon: Database,
    title: "RESTful APIs",
    description: "Well-structured API endpoints following REST conventions",
  },
  {
    icon: Zap,
    title: "Jobs & Queues",
    description: "Asynchronous task processing with Laravel Queue system",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Database and broadcast notifications for instant updates",
  },
  {
    icon: Mail,
    title: "Email System",
    description: "Templated emails with Laravel Mail and queue integration",
  },
  {
    icon: GitBranch,
    title: "DevOps Ready",
    description: "CI/CD pipeline integration and deployment automation",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 bg-gradient-subtle">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Features & Capabilities</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the production-level features implemented in this demo portal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elevated animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

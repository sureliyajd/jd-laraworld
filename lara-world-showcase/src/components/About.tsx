import { User } from "lucide-react";

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

        <div className="max-w-4xl mx-auto">
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <p className="text-lg text-foreground leading-relaxed mb-6">
                I'm <span className="font-semibold text-primary">Jaydeep Sureliya</span>, a full-stack developer passionate about Laravel, React, and DevOps.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Project Purpose</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This Laravel World showcase is designed to demonstrate my expertise in building production-ready full-stack applications. 
                  It serves as a comprehensive portfolio piece that showcases real-world development skills, architectural decisions, 
                  and modern development practices that I bring to professional projects.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">What's Included in This Demo</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-2">Backend Features (Laravel)</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• RESTful API with proper authentication</li>
                        <li>• OAuth2 with Laravel Passport</li>
                        <li>• Task management system with CRUD operations</li>
                        <li>• File upload and attachment handling</li>
                        <li>• User management and role-based access</li>
                        <li>• Database relationships and migrations</li>
                        <li>• API resource transformations</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-medium text-foreground mb-2">Frontend Features (React + TypeScript)</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Modern React with TypeScript</li>
                        <li>• Responsive design with Tailwind CSS</li>
                        <li>• State management and API integration</li>
                        <li>• File upload with progress tracking</li>
                        <li>• Real-time UI updates</li>
                        <li>• Form validation and error handling</li>
                        <li>• Component-based architecture</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Technical Highlights</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This project demonstrates proficiency in modern web development including API design, authentication flows, 
                  file handling, responsive UI design, and clean code architecture. It's built with production considerations 
                  in mind, showcasing both technical skills and attention to user experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

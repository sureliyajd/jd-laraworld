import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const LandingPage = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default LandingPage;

import { Hero } from "@/components/Hero";
import { VideoShowcase } from "@/components/VideoShowcase";
import { About } from "@/components/About";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

const LandingPage = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <VideoShowcase />
      <About />
      <Features />
      <Footer />
    </main>
  );
};

export default LandingPage;

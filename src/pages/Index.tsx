import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GuideSection from "@/components/GuideSection";
import PromptBuilder from "@/components/PromptBuilder";
import ExploreSection from "@/components/ExploreSection";
import ResourcesSection from "@/components/ResourcesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <GuideSection />
          <PromptBuilder />
          <ExploreSection />
          <ResourcesSection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Index;

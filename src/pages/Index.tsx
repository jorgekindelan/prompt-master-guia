import { ThemeProvider } from "next-themes";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GuideSection from "@/components/GuideSection";
import PromptBuilder from "@/components/PromptBuilder";
import ExploreSection from "@/components/ExploreSection";
import ResourcesSection from "@/components/ResourcesSection";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <Header />
        {user && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => navigate('/dashboard')}
              className="shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear Prompt
            </Button>
          </div>
        )}
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

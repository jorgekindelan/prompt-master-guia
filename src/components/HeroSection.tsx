import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Target } from "lucide-react";
const HeroSection = () => {
  const scrollToGuide = () => {
    const element = document.querySelector('#guia');
    if (element) {
      element.scrollIntoView({
        behavior: "smooth"
      });
    }
  };
  return <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-primary rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-primary rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-20 right-10 w-4 h-4 bg-primary rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Main Hero Content */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            IA Transformers
            <span className="text-primary block mt-2">Playground</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">El playground de IA Transformers donde puedes aprender, crear prompts profesionales, compartir tus creaciones y explorar los prompts de la comunidad.</p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-semibold shadow-elegant animate-scale-in" onClick={scrollToGuide}>
              Explorar Guía
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button size="lg" variant="hero-outline" className="px-8 py-6 text-lg animate-scale-in delay-200" onClick={() => document.querySelector('#builder')?.scrollIntoView({
            behavior: 'smooth'
          })}>
              Crear Prompt
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Zap className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Técnicas Avanzadas</h3>
              <p className="text-white/80 text-sm">
                Aprende Chain-of-Thought, Few-shot y más técnicas profesionales
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Target className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Explora prompts</h3>
              <p className="text-white/80 text-sm">Aprovecha ser parte de esta gran comunidad compartiendo y haciendo uso de diferentes prompts

            </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Sparkles className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-2">Builder Interactivo</h3>
              <p className="text-white/80 text-sm">
                Crea prompts personalizados paso a paso con nuestro constructor
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>;
};
export default HeroSection;
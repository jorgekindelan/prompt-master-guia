import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Book, Sparkles, Loader2 } from "lucide-react";
import { modelCardService } from "@/lib/services/modelCardService";
import { keywordService } from "@/lib/services/keywordService";
import type { ModelCard, Keyword } from "@/lib/types";

const ResourcesSection = () => {
  const [aiModels, setAiModels] = useState<ModelCard[]>([]);
  const [glossaryTerms, setGlossaryTerms] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [models, keywords] = await Promise.all([
          modelCardService.list(),
          keywordService.list()
        ]);
        setAiModels(models);
        setGlossaryTerms(keywords);
      } catch (error) {
        console.error('Error fetching resources data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPricingColor = (price: string) => {
    switch (price) {
      case "Gratis": return "bg-emerald-500 text-white";
      case "Freemium": return "bg-amber-500 text-white";
      case "Pago": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <section id="recursos" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando recursos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="recursos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Recursos y <span className="text-primary">Herramientas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre las mejores herramientas, plataformas y recursos para potenciar 
            tus habilidades con modelos de IA y mantenerte actualizado.
          </p>
        </div>

        {/* AI Models Section */}
        <div className="animate-slide-up">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 rounded-lg bg-blue-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Modelos de IA Principales</h3>
          </div>

          {aiModels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay modelos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiModels.map((model) => (
                <Card key={model.id} className="shadow-card-custom hover:shadow-elegant transition-all duration-300 flex flex-col h-full">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {model.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/10"
                      asChild
                    >
                      <a href={model.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver más
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Glossary Section */}
        <div className="mt-20 animate-fade-in">
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-lg bg-primary">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">Diccionario de Términos</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Conceptos esenciales que todo usuario de IA debe conocer
            </p>
          </div>

          {glossaryTerms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay términos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
              {glossaryTerms.map((term, index) => (
                <Card 
                  key={term.id} 
                  className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary text-lg">{term.name}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {term.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ResourcesSection;
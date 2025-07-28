import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Book, Wrench, Globe, Users, Sparkles, Star } from "lucide-react";

const ResourcesSection = () => {
  const aiModels = [
    {
      name: "ChatGPT",
      description: "El modelo conversacional más popular de OpenAI",
      url: "https://chat.openai.com",
      type: "Plataforma",
      price: "Freemium",
      rating: 4.8,
      features: ["Conversación natural", "Código", "Análisis de texto", "Creatividad"]
    },
    {
      name: "Claude",
      description: "IA de Anthropic enfocada en seguridad y utilidad",
      url: "https://claude.ai",
      type: "Plataforma",
      price: "Freemium",
      rating: 4.7,
      features: ["Análisis profundo", "Documentos largos", "Programación", "Investigación"]
    },
    {
      name: "Gemini",
      description: "Modelo multimodal avanzado de Google",
      url: "https://gemini.google.com",
      type: "Plataforma",
      price: "Gratis",
      rating: 4.6,
      features: ["Multimodal", "Integración Google", "Búsqueda en tiempo real", "Análisis visual"]
    },
    {
      name: "Perplexity AI",
      description: "Motor de búsqueda conversacional con fuentes",
      url: "https://perplexity.ai",
      type: "Buscador IA",
      price: "Freemium",
      rating: 4.5,
      features: ["Búsqueda con fuentes", "Información actualizada", "Citas precisas", "Investigación"]
    },
    {
      name: "Microsoft Copilot",
      description: "Asistente IA integrado en el ecosistema Microsoft",
      url: "https://copilot.microsoft.com",
      type: "Plataforma",
      price: "Freemium",
      rating: 4.4,
      features: ["Integración Office", "Búsqueda mejorada", "Productividad", "Análisis datos"]
    },
    {
      name: "Meta AI",
      description: "Asistente de Meta para redes sociales y creatividad",
      url: "https://www.meta.ai",
      type: "Plataforma", 
      price: "Gratis",
      rating: 4.3,
      features: ["Creatividad visual", "Redes sociales", "Generación imágenes", "Conversación"]
    }
  ];

  const glossaryTerms = [
    { term: "Prompt", definition: "Instrucción o pregunta que se da a un modelo de IA para obtener una respuesta específica" },
    { term: "Few-shot", definition: "Técnica que proporciona pocos ejemplos al modelo para guiar su respuesta" },
    { term: "Zero-shot", definition: "Técnica donde se da una instrucción sin ejemplos previos" },
    { term: "Chain-of-Thought (CoT)", definition: "Método que pide al modelo mostrar su razonamiento paso a paso" },
    { term: "Temperature", definition: "Parámetro que controla la creatividad/aleatoriedad de las respuestas del modelo" },
    { term: "Token", definition: "Unidad básica de texto que procesa el modelo (palabra, parte de palabra o carácter)" },
    { term: "Context Window", definition: "Cantidad máxima de texto que el modelo puede procesar en una conversación" },
    { term: "Fine-tuning", definition: "Proceso de entrenar un modelo pre-entrenado con datos específicos" },
    { term: "Hallucination", definition: "Cuando el modelo genera información incorrecta o inventada" },
    { term: "ReAct", definition: "Técnica que combina razonamiento (Reasoning) y acción (Acting) en prompts" }
  ];

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiModels.map((model, index) => (
              <Card key={model.name} className="shadow-card-custom hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">{model.name}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {model.type}
                        </Badge>
                        <Badge 
                          variant={model.price === "Gratis" ? "default" : "secondary"} 
                          className="text-xs"
                        >
                          {model.price}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-muted-foreground">{model.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-sm leading-relaxed">
                    {model.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {model.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{model.features.length - 3} más
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-primary/10"
                      asChild
                    >
                      <a href={model.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Probar
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Glossary Section */}
        <div className="mt-20 animate-fade-in">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 rounded-lg bg-primary">
                <Book className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">Diccionario de Términos</h3>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conceptos esenciales que todo usuario de IA debe conocer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {glossaryTerms.map((term, index) => (
              <Card 
                key={term.term} 
                className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary text-lg">{term.term}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {term.definition}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ResourcesSection;
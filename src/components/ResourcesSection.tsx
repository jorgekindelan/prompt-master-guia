import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Book, Wrench, Globe, Users, Sparkles, Star } from "lucide-react";

const ResourcesSection = () => {
  const toolCategories = [
    {
      title: "Modelos de IA Principales",
      icon: Sparkles,
      color: "bg-blue-500",
      resources: [
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
        }
      ]
    },
    {
      title: "Herramientas y Extensiones",
      icon: Wrench,
      color: "bg-purple-500",
      resources: [
        {
          name: "AIPRM for ChatGPT",
          description: "Biblioteca de prompts y plantillas para ChatGPT",
          url: "https://www.aiprm.com",
          type: "Extensión",
          price: "Freemium",
          rating: 4.4,
          features: ["Prompts predefinidos", "Categorías organizadas", "Comunidad activa", "Fácil instalación"]
        },
        {
          name: "Merlin AI",
          description: "Asistente IA para navegador con múltiples modelos",
          url: "https://merlin.foyer.work",
          type: "Extensión",
          price: "Freemium",
          rating: 4.3,
          features: ["Múltiples modelos", "Resúmenes web", "Escritura", "Investigación"]
        },
        {
          name: "Notion AI",
          description: "IA integrada en el ecosistema de productividad Notion",
          url: "https://notion.so",
          type: "Herramienta",
          price: "Premium",
          rating: 4.2,
          features: ["Integración Notion", "Escritura colaborativa", "Organización", "Plantillas"]
        }
      ]
    },
    {
      title: "Recursos Educativos",
      icon: Book,
      color: "bg-green-500",
      resources: [
        {
          name: "Prompt Engineering Guide",
          description: "Guía completa de ingeniería de prompts",
          url: "https://www.promptingguide.ai",
          type: "Documentación",
          price: "Gratis",
          rating: 4.9,
          features: ["Técnicas avanzadas", "Ejemplos prácticos", "Investigación académica", "Actualizaciones constantes"]
        },
        {
          name: "Learn Prompting",
          description: "Curso interactivo de prompting desde cero",
          url: "https://learnprompting.org",
          type: "Curso",
          price: "Gratis",
          rating: 4.7,
          features: ["Lecciones estructuradas", "Ejercicios prácticos", "Comunidad", "Certificación"]
        },
        {
          name: "OpenAI Cookbook",
          description: "Ejemplos y mejores prácticas de OpenAI",
          url: "https://cookbook.openai.com",
          type: "Documentación",
          price: "Gratis",
          rating: 4.6,
          features: ["Casos de uso reales", "Código ejemplo", "API documentation", "Best practices"]
        }
      ]
    },
    {
      title: "Comunidades y Foros",
      icon: Users,
      color: "bg-orange-500",
      resources: [
        {
          name: "r/ChatGPT",
          description: "Comunidad de Reddit sobre ChatGPT y prompting",
          url: "https://reddit.com/r/ChatGPT",
          type: "Comunidad",
          price: "Gratis",
          rating: 4.3,
          features: ["Discusiones activas", "Prompts compartidos", "Noticias", "Soporte comunidad"]
        },
        {
          name: "Prompt Engineering Discord",
          description: "Servidor de Discord para entusiastas del prompting",
          url: "#",
          type: "Comunidad",
          price: "Gratis",
          rating: 4.4,
          features: ["Chat en tiempo real", "Canales especializados", "Eventos", "Networking"]
        },
        {
          name: "AI Prompts Facebook Group",
          description: "Grupo de Facebook para compartir prompts y técnicas",
          url: "#",
          type: "Comunidad",
          price: "Gratis",
          rating: 4.1,
          features: ["Prompts diarios", "Desafíos creativos", "Soporte peer-to-peer", "Recursos compartidos"]
        }
      ]
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
            tus habilidades de prompting y mantenerte actualizado.
          </p>
        </div>

        {/* Tools and Platforms */}
        <div className="space-y-12">
          {toolCategories.map((category, categoryIndex) => (
            <div key={category.title} className="animate-slide-up" style={{ animationDelay: `${categoryIndex * 200}ms` }}>
              <div className="flex items-center space-x-3 mb-8">
                <div className={`p-3 rounded-lg ${category.color}`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.resources.map((resource, index) => (
                  <Card key={resource.name} className="shadow-card-custom hover:shadow-elegant transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-1">{resource.name}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {resource.type}
                            </Badge>
                            <Badge 
                              variant={resource.price === "Gratis" ? "default" : "secondary"} 
                              className="text-xs"
                            >
                              {resource.price}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-muted-foreground">{resource.rating}</span>
                        </div>
                      </div>
                      <CardDescription className="text-sm leading-relaxed">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {/* Features */}
                        <div className="flex flex-wrap gap-1">
                          {resource.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {resource.features.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{resource.features.length - 3} más
                            </Badge>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-primary/10"
                          asChild
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visitar
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
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

        {/* Call to Action */}
        <div className="text-center mt-16 animate-slide-up">
          <Card className="max-w-2xl mx-auto shadow-elegant bg-gradient-card">
            <CardContent className="p-8">
              <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-foreground mb-4">
                ¿Conoces algún recurso útil?
              </h3>
              <p className="text-muted-foreground mb-6">
                Ayúdanos a mantener esta lista actualizada compartiendo herramientas 
                y recursos que hayas encontrado útiles.
              </p>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => document.querySelector('#comunidad')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contribuir a la Comunidad
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
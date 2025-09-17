import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Book, Sparkles } from "lucide-react";

const ResourcesSection = () => {
  const getPricingColor = (price: string) => {
    switch (price) {
      case "Gratis": return "bg-emerald-500 text-white";
      case "Freemium": return "bg-amber-500 text-white";
      case "Pago": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const aiModels = [
    {
      name: "ChatGPT",
      description: "El modelo conversacional más popular de OpenAI que revolucionó la interacción con IA. Capaz de mantener conversaciones naturales, generar código, escribir textos creativos y resolver problemas complejos. Su versión GPT-4 ofrece capacidades multimodales avanzadas y un razonamiento más sofisticado.",
      url: "https://chat.openai.com",
      price: "Freemium"
    },
    {
      name: "Claude",
      description: "Desarrollado por Anthropic, Claude se destaca por su enfoque en la seguridad y la utilidad práctica. Especialmente efectivo para análisis de documentos largos, programación compleja y tareas que requieren razonamiento ético. Su ventana de contexto extendida permite trabajar con textos muy extensos.",
      url: "https://claude.ai",
      price: "Freemium"
    },
    {
      name: "Gemini",
      description: "El modelo multimodal más avanzado de Google que integra texto, imágenes, audio y video en una sola plataforma. Ofrece acceso en tiempo real a información actualizada de Google Search y se integra perfectamente con el ecosistema de Google Workspace.",
      url: "https://gemini.google.com",
      price: "Gratis"
    },
    {
      name: "Perplexity AI",
      description: "Un motor de búsqueda conversacional único que combina IA generativa con búsqueda web en tiempo real. Proporciona respuestas precisas con citas y fuentes verificables, ideal para investigación académica, periodismo y verificación de información actualizada.",
      url: "https://perplexity.ai",
      price: "Freemium"
    },
    {
      name: "Microsoft Copilot",
      description: "Asistente de IA totalmente integrado en el ecosistema Microsoft que potencia Office 365, Windows y Edge. Especializado en productividad empresarial, análisis de datos, automatización de tareas y creación de contenido profesional con acceso directo a tus documentos y aplicaciones.",
      url: "https://copilot.microsoft.com",
      price: "Freemium"
    },
    {
      name: "Meta AI",
      description: "El asistente inteligente de Meta optimizado para creatividad visual y social. Sobresale en la generación de imágenes, creación de contenido para redes sociales y conversaciones naturales. Integrado en WhatsApp, Instagram y Facebook para una experiencia social fluida.",
      url: "https://www.meta.ai",
      price: "Gratis"
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
            {aiModels.map((model) => (
              <Card key={model.name} className="shadow-card-custom hover:shadow-elegant transition-all duration-300 flex flex-col h-full">
                <CardHeader className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-lg">{model.name}</CardTitle>
                    <Badge className={`${getPricingColor(model.price)} font-semibold`}>
                      {model.price}
                    </Badge>
                  </div>
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
                    <a href={model.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Probar
                    </a>
                  </Button>
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
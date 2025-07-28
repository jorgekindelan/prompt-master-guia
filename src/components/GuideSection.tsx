import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lightbulb, Code, Palette, Brain, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GuideSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const copyPrompt = (prompt: string, title: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    toast({
      title: "¡Prompt copiado!",
      description: `${title} copiado al portapapeles`,
    });
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const guideCategories = [
    {
      id: "fundamentos",
      title: "Fundamentos del Prompting",
      icon: BookOpen,
      color: "bg-blue-500",
      description: "Aprende los conceptos básicos y estructura de un buen prompt",
      items: [
        {
          id: "que-es-prompt",
          title: "¿Qué es un prompt?",
          content: "Un prompt es una instrucción o consulta que das a un modelo de IA para obtener una respuesta específica. Es como una conversación dirigida donde tú estableces el contexto y la dirección.",
          example: "Explica el concepto de fotosíntesis de manera simple para un niño de 10 años, usando analogías con cosas cotidianas."
        },
        {
          id: "estructura-prompt",
          title: "Estructura de un buen prompt",
          content: "Un prompt efectivo tiene: Contexto + Tarea específica + Formato deseado + Tono/Estilo",
          example: "Contexto: Eres un experto en marketing digital.\nTarea: Crea un plan de contenido para redes sociales.\nFormato: Lista numerada con 10 ideas.\nTono: Profesional pero creativo."
        },
        {
          id: "tipos-prompting",
          title: "Tipos de prompting",
          content: "Directo: Instrucciones claras y específicas. Indirecto: Preguntas que guían al modelo hacia la respuesta deseada.",
          example: "Directo: 'Resume este artículo en 3 puntos clave.'\nIndirecto: '¿Cuáles serían los aspectos más importantes que un lector debería recordar de este artículo?'"
        }
      ]
    },
    {
      id: "tecnicas",
      title: "Técnicas Avanzadas",
      icon: Brain,
      color: "bg-purple-500",
      description: "Domina técnicas profesionales como Chain-of-Thought y Few-shot",
      items: [
        {
          id: "few-shot",
          title: "Few-shot Prompting",
          content: "Proporciona ejemplos específicos para guiar el comportamiento del modelo.",
          example: "Clasifica estos sentimientos:\n\nTexto: 'Me encanta este producto'\nSentimiento: Positivo\n\nTexto: 'No funciona bien'\nSentimiento: Negativo\n\nTexto: 'El servicio fue increíble'\nSentimiento: ?"
        },
        {
          id: "chain-of-thought",
          title: "Chain-of-Thought (CoT)",
          content: "Pide al modelo que muestre su razonamiento paso a paso.",
          example: "Resuelve este problema paso a paso, mostrando tu razonamiento:\n\nSi una tienda vende 150 productos al día y cada producto cuesta $25, ¿cuánto gana en una semana? Explica cada paso de tu cálculo."
        },
        {
          id: "react-prompting",
          title: "ReAct Prompting",
          content: "Combina razonamiento y acción para tareas complejas.",
          example: "Analiza este problema y describe qué acciones tomarías:\n\nProblema: Las ventas online han bajado 30%\nRazonamiento: [explica las posibles causas]\nAcción: [describe pasos específicos a seguir]"
        }
      ]
    },
    {
      id: "plantillas",
      title: "Plantillas y Fórmulas",
      icon: Palette,
      color: "bg-green-500",
      description: "Plantillas probadas para casos de uso específicos",
      items: [
        {
          id: "resumir-textos",
          title: "Plantilla para resumir textos",
          content: "Formula perfecta para crear resúmenes efectivos y estructurados.",
          example: "Resume el siguiente texto en [número] puntos clave, manteniendo las ideas principales y usando un lenguaje [formal/informal]. Incluye una conclusión de una oración al final.\n\n[TEXTO A RESUMIR]"
        },
        {
          id: "generar-codigo",
          title: "Plantilla para generar código",
          content: "Estructura para obtener código limpio y documentado.",
          example: "Actúa como un desarrollador senior en [lenguaje]. Crea una función que [descripción de la funcionalidad]. Incluye:\n- Comentarios explicativos\n- Manejo de errores\n- Ejemplos de uso\n- Código optimizado y legible"
        },
        {
          id: "brainstorming",
          title: "Plantilla para brainstorming",
          content: "Genera ideas creativas y variadas para cualquier proyecto.",
          example: "Actúa como un consultor creativo. Genera 10 ideas innovadoras para [tema/proyecto]. Para cada idea incluye:\n- Título llamativo\n- Descripción breve\n- Ventajas principales\n- Viabilidad (1-10)\n\nSé creativo y piensa fuera de lo convencional."
        }
      ]
    },
    {
      id: "categorias",
      title: "Prompts por Categoría",
      icon: Code,
      color: "bg-orange-500",
      description: "Prompts especializados para diferentes áreas y profesiones",
      items: [
        {
          id: "educacion",
          title: "Educación y Aprendizaje",
          content: "Prompts diseñados para mejorar el proceso de enseñanza y aprendizaje.",
          example: "Crea un plan de estudio de 30 días para [tema]. Incluye:\n- Objetivos diarios específicos\n- Recursos recomendados\n- Ejercicios prácticos\n- Métodos de evaluación\n- Consejos de memorización\n\nAdapta el contenido para nivel [principiante/intermedio/avanzado]."
        },
        {
          id: "marketing",
          title: "Marketing y Contenido",
          content: "Estrategias de marketing digital y creación de contenido persuasivo.",
          example: "Crea una estrategia de contenido para [marca/producto] dirigida a [audiencia objetivo]. Incluye:\n- 5 tipos de contenido diferentes\n- Cronograma semanal\n- CTAs específicos\n- Métricas a seguir\n- Adapta el tono para [red social específica]"
        },
        {
          id: "programacion",
          title: "Programación y Desarrollo",
          content: "Prompts técnicos para desarrollo de software y resolución de problemas.",
          example: "Actúa como arquitecto de software. Diseña la estructura para [tipo de aplicación]. Incluye:\n- Arquitectura general\n- Tecnologías recomendadas\n- Base de datos y relaciones\n- APIs necesarias\n- Consideraciones de seguridad\n- Plan de escalabilidad"
        }
      ]
    }
  ];

  return (
    <section id="guia" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Guía Completa de <span className="text-primary">IA</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Desde los fundamentos básicos hasta técnicas avanzadas de modelos transformer. 
            Todo lo que necesitas para convertirte en un experto en inteligencia artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {guideCategories.map((category, index) => (
            <Card key={category.id} className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${itemIndex}`}>
                      <AccordionTrigger className="text-left hover:text-primary">
                        <div className="flex items-center space-x-2">
                          <ChevronRight className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>
                        
                        {item.example && (
                          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                Ejemplo
                              </Badge>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyPrompt(item.example!, item.title)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <Copy className={`h-4 w-4 ${copiedPrompt === item.example ? 'text-primary' : 'text-muted-foreground'}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/guia/${category.id}/${item.id}`)}
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded border">
                              {item.example}
                            </pre>
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/guia/${category.id}/${item.id}`)}
                            className="hover:bg-primary/10"
                          >
                            Ver guía completa
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4"
            onClick={() => document.querySelector('#builder')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Prueba el Builder Interactivo
            <Lightbulb className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
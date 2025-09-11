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

  const pilares = [
    {
      id: "rol",
      title: "1. Rol",
      subtitle: "Quién debe ser la IA",
      icon: BookOpen,
      color: "bg-red-500",
      description: "Define la perspectiva y el conjunto de conocimientos que la IA debe adoptar",
      content: "El primer paso para enfocar la respuesta de la IA es decirle quién debe ser. Esto se logra instruyendo al modelo para que adopte una personalidad o un rol de experto específico. Al asignar un rol, se le indica al modelo que acceda a los patrones de lenguaje, vocabulario, tono y estructuras de conocimiento asociados con esa profesión específica dentro de sus vastos datos de entrenamiento.",
      componentes: [
        "Profesión o Cargo: 'Actúa como un experto en marketing digital', 'Eres un nutricionista clínico'",
        "Personaje o Arquetipo: 'Compórtate como un filósofo estoico', 'Responde como si fueras un pirata escéptico'",
        "Nivel de Experiencia: 'Explícalo como un profesor universitario', 'Redacta esto para un principiante absoluto'",
        "Rol Específico: 'Eres un ingeniero de software en una startup tecnológica'",
        "Perspectiva del Usuario: 'Adopta el rol de un cliente interesado en nuestro producto'"
      ],
      ejemplos: [
        "Actúa como un chef michelin especializado en cocina mediterránea con 15 años de experiencia.",
        "Eres una psicóloga clínica experta en terapia cognitivo-conductual para adolescentes.",
        "Asume el papel de un consultor financiero que ayuda a startups a conseguir inversión.",
        "Compórtate como un entrenador personal certificado especializado en rehabilitación deportiva."
      ]
    },
    {
      id: "contexto",
      title: "2. Contexto",
      subtitle: "Dónde está y por qué está aquí",
      icon: Lightbulb,
      color: "bg-blue-500",
      description: "Proporciona toda la información de fondo que la IA necesita para entender el propósito",
      content: "Si el rol le dice a la IA 'quién es', el contexto le dice 'dónde está' y 'por qué está aquí'. El contexto es toda la información de fondo, la situación y los datos relevantes que la IA necesita para comprender el propósito real de la solicitud. Sin contexto, la IA se ve obligada a hacer suposiciones, y estas suposiciones casi siempre son incorrectas o demasiado genéricas.",
      componentes: [
        "Información de Fondo: 'Mi empresa, EcoSabor, va a lanzar un nuevo producto'",
        "Propósito u Objetivo Final: 'El objetivo es convencer a los inversores'",
        "Detalles del Producto/Servicio: 'Es una aplicación de fitness que usa IA'",
        "Valores de la Marca: 'Nuestra marca se centra en la sostenibilidad y transparencia'",
        "Eventos Previos: 'Este email es para clientes que ya compraron el producto anterior'",
        "Datos Específicos: 'Teniendo en cuenta que nuestro presupuesto es de 5.000 €'"
      ],
      ejemplos: [
        "Contexto: Trabajo en una agencia de marketing digital que se especializa en e-commerce. Tenemos un cliente del sector moda sostenible que quiere lanzar su nueva colección de verano. Su audiencia principal son mujeres de 25-40 años preocupadas por el medio ambiente.",
        "Situación: Soy profesora de instituto y mis estudiantes de 16 años están luchando con conceptos básicos de física. Necesito explicar la gravedad de forma que puedan entenderla y aplicarla en problemas prácticos.",
        "Background: Dirijo una startup tecnológica que desarrolla apps móviles. Estamos en proceso de buscar financiación Serie A y necesitamos presentar nuestro producto a inversores que no tienen background técnico."
      ]
    },
    {
      id: "tarea",
      title: "3. Tarea",
      subtitle: "La acción específica a realizar",
      icon: Brain,
      color: "bg-green-500",
      description: "El corazón del prompt: la acción principal que se desea que la IA realice",
      content: "La tarea es el corazón del prompt: la acción principal que se desea que la IA realice. La ambigüedad es el enemigo número uno de los buenos resultados. Por ello, la tarea debe definirse de la forma más clara, concisa e inequívoca posible. El uso de verbos de acción fuertes es fundamental. Para misiones muy complejas, una estrategia de nivel experto es dividir la tarea principal en subtareas más pequeñas y manejables.",
      componentes: [
        "Verbo de Acción Principal: 'Resume', 'Analiza', 'Compara y contrasta', 'Crea una lista'",
        "Entregable Específico: 'Un guion para un vídeo de 2 minutos', 'Una tabla comparativa'",
        "Instrucciones Paso a Paso: 'Paso 1: Analiza el texto. Paso 2: Extrae las 3 ideas principales'",
        "Resolución de Problemas: 'Identifica los tres mayores riesgos y sugiere medidas'",
        "Generación Creativa: 'Escribe un soneto sobre la inteligencia artificial'"
      ],
      ejemplos: [
        "Analiza el plan de marketing adjunto e identifica 5 oportunidades de mejora. Para cada oportunidad, proporciona una recomendación específica y actionable.",
        "Crea una lista de 10 títulos llamativos para artículos de blog sobre productividad personal. Cada título debe tener entre 8-12 palabras y generar curiosidad.",
        "Redacta un email de seguimiento profesional para enviar a un cliente potencial después de una reunión comercial. El email debe ser de máximo 150 palabras.",
        "Compara las ventajas y desventajas de React vs Vue.js para el desarrollo frontend. Presenta la información en formato tabla con criterios específicos."
      ]
    },
    {
      id: "audiencia",
      title: "4. Audiencia",
      subtitle: "Para quién es la respuesta",
      icon: Code,
      color: "bg-purple-500",
      description: "Especifica explícitamente para quién se está creando la respuesta",
      content: "Un elemento que a menudo se pasa por alto pero que tiene un impacto masivo en el resultado es especificar explícitamente para quién se está creando la respuesta. La audiencia objetivo influye directamente en el tono, la complejidad del vocabulario, el nivel de detalle y la elección de palabras. Definir la audiencia le proporciona a la IA un filtro crucial para adaptar su comunicación.",
      componentes: [
        "Datos Demográficos: 'Jóvenes profesionales urbanos (25-40 años)'",
        "Nivel de Conocimiento: 'Un público no técnico sin conocimientos de programación'",
        "Intereses y Valores: 'Consumidores que valoran los productos ecológicos'",
        "Relación con el Emisor: 'Clientes leales', 'El equipo directivo de la empresa'"
      ],
      ejemplos: [
        "Audiencia: Emprendedores primerizos sin experiencia previa en negocios, de 25-35 años, que buscan validar su primera idea de startup.",
        "Para: Niños de 8-12 años curiosos por la ciencia, que aprenden mejor con ejemplos visuales y analogías divertidas.",
        "Dirigido a: Ejecutivos senior de empresas Fortune 500 que toman decisiones de inversión en tecnología y valoran datos concretos y ROI.",
        "Audiencia objetivo: Padres millennials preocupados por la educación de sus hijos y que buscan herramientas digitales seguras y efectivas."
      ]
    },
    {
      id: "formato",
      title: "5. Formato de Salida",
      subtitle: "Cómo estructurar la respuesta",
      icon: Palette,
      color: "bg-orange-500",
      description: "Indica la estructura exacta en la que deseas recibir la respuesta",
      content: "Por defecto, la IA a menudo responderá en un formato de párrafo conversacional. Sin embargo, en la mayoría de los casos prácticos, se necesita la información en una estructura específica para poder utilizarla en un informe, una presentación, una hoja de cálculo o una aplicación de software. Por lo tanto, es vital indicar explícitamente el formato de salida deseado.",
      componentes: [
        "Estructura del Texto: 'Una tabla con tres columnas', 'Una lista con viñetas'",
        "Formato de Datos: 'Un objeto JSON válido', 'Código en Python'",
        "Tipo de Documento: 'Un borrador de correo electrónico con asunto y cuerpo'"
      ],
      ejemplos: [
        "Formato: Responde en JSON con las siguientes claves: {'problema': '', 'solucion': '', 'recursos_necesarios': [], 'timeline': ''}",
        "Estructura la respuesta como una tabla markdown con columnas: Estrategia | Ventajas | Desventajas | Costo Estimado | Tiempo de Implementación",
        "Presenta la información como un email formal con: Asunto claro, saludo profesional, 3 párrafos principales, llamada a la acción y cierre cortés.",
        "Formato de salida: Lista numerada con exactamente 7 puntos. Cada punto debe tener un título en negrita seguido de 2-3 líneas de explicación."
      ]
    },
    {
      id: "ejemplos",
      title: "6. Ejemplos",
      subtitle: "Mostrar el patrón deseado",
      icon: Lightbulb,
      color: "bg-pink-500",
      description: "Una de las técnicas más poderosas para guiar el comportamiento de la IA",
      content: "Una de las técnicas más poderosas y efectivas en la ingeniería de prompts es incluir uno o dos ejemplos del resultado exacto que se espera. Esta técnica, conocida como few-shot prompting, es como darle a la IA una guía de estilo y estructura en tiempo real. Los ejemplos le muestran al modelo el patrón exacto que debe seguir, reduciendo drásticamente la posibilidad de malentendidos.",
      componentes: [
        "Pares de Entrada-Salida: 'Clasifica el sentimiento. Ejemplo 1: Me encantó el producto -> Positivo'",
        "Muestra de Estilo: 'Quiero que escribas con este estilo: El cosmos susurra secretos...'",
        "Plantilla de Estructura: 'Rellena la plantilla: Producto: [Nombre], Beneficio: [Descripción]'"
      ],
      ejemplos: [
        "Ejemplo de clasificación:\nTexto: 'El servicio al cliente fue excepcional' → Categoría: Experiencia Positiva\nTexto: 'La entrega llegó con retraso' → Categoría: Problema Logístico\nTexto: 'El producto es exactamente lo que esperaba' → Categoría: Expectativas Cumplidas\n\nAhora clasifica: 'La aplicación se cuelga constantemente'",
        "Ejemplo de estilo de escritura:\n'La tecnología blockchain revoluciona silenciosamente el mundo financiero, tejiendo una red de confianza descentralizada que trasciende fronteras tradicionales.'\n\nUsando este mismo estilo poético y metafórico, describe la inteligencia artificial.",
        "Plantilla a seguir:\nProblema: [Descripción específica]\nImpacto: [Consecuencias cuantificables]\nSolución propuesta: [Acción concreta]\nRecursos necesarios: [Lista específica]\n\nCompleta esta plantilla para el problema de rotación de empleados en startups."
      ]
    },
    {
      id: "restricciones",
      title: "7. Restricciones",
      subtitle: "Los límites a respetar",
      icon: Brain,
      color: "bg-indigo-500",
      description: "Las barandillas que mantienen la respuesta dentro del camino correcto",
      content: "Finalmente, un prompt magistral define las limitaciones y reglas que la IA debe seguir. Las restricciones son las 'barandillas' que mantienen la respuesta dentro del camino correcto, asegurando que se ajuste a las necesidades específicas del proyecto. Estas reglas evitan que la IA se extienda innecesariamente, dé respuestas fuera de los límites del proyecto o 'alucine', aumentando enormemente la fiabilidad del resultado.",
      componentes: [
        "Límites de Longitud: 'No excedas las 150 palabras', 'Resume esto en exactamente tres frases'",
        "Tono de Voz: 'Usa un tono profesional pero cercano', 'Evita el lenguaje técnico'",
        "Contenido Obligatorio/Prohibido: 'Menciona nuestros tres valores clave', 'No menciones competencia'",
        "Reglas de Comportamiento: 'Si no conoces la respuesta, indica No tengo información suficiente'",
        "Requisitos Técnicos: 'El código debe ser compatible con Python 3.9'"
      ],
      ejemplos: [
        "RESTRICCIONES:\n- Máximo 200 palabras\n- Tono profesional pero accesible\n- No mencionar marcas competidoras\n- Incluir al menos 2 beneficios cuantificables\n- Si no tienes datos exactos, indicar 'Dato aproximado' entre paréntesis",
        "Limitaciones técnicas:\n- Solo usar librerías estándar de Python\n- El código debe ejecutarse en menos de 5 segundos\n- Incluir comentarios para cada función\n- Manejar errores con try-except\n- Variables en español y funciones en inglés",
        "Reglas de contenido:\n- Escribir exactamente 5 párrafos\n- Cada párrafo entre 50-80 palabras\n- Comenzar cada párrafo con una pregunta retórica\n- Terminar con una llamada a la acción clara\n- No usar jerga técnica sin explicarla"
      ]
    }
  ];

  return (
    <section id="guia" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Los 7 Pilares del <span className="text-primary">Prompt Engineering</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Domina los elementos fundamentales para crear prompts magistrales que generen resultados extraordinarios. 
            Cada pilar es esencial para construir instrucciones efectivas y obtener respuestas de calidad profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {pilares.map((pilar, index) => (
            <Card key={pilar.id} className="shadow-card-custom hover:shadow-elegant transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-lg ${pilar.color}`}>
                    <pilar.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pilar.title}</CardTitle>
                    <CardDescription className="text-sm">{pilar.subtitle}</CardDescription>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{pilar.description}</p>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="content">
                    <AccordionTrigger className="text-left hover:text-primary">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4" />
                        <span>Explicación detallada</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {pilar.content}
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="components">
                    <AccordionTrigger className="text-left hover:text-primary">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4" />
                        <span>Componentes y variables</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      {pilar.componentes.map((componente, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary/30">
                          <p className="text-sm text-foreground">{componente}</p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="examples">
                    <AccordionTrigger className="text-left hover:text-primary">
                      <div className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4" />
                        <span>Ejemplos prácticos</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {pilar.ejemplos.map((ejemplo, idx) => (
                        <div key={idx} className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Ejemplo {idx + 1}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPrompt(ejemplo, `${pilar.title} - Ejemplo ${idx + 1}`)}
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <Copy className={`h-4 w-4 ${copiedPrompt === ejemplo ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                          </div>
                          <pre className="text-xs text-foreground whitespace-pre-wrap font-mono bg-background/50 p-3 rounded border">
                            {ejemplo}
                          </pre>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
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
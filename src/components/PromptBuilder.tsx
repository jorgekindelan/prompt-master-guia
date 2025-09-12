import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Wand2, RefreshCw, ChevronLeft, ChevronRight, User, Target, Users, Volume2, Palette, BookOpen, Shield, MessageCircle, FileText, Settings2, Globe, Eye, Sparkles, ArrowLeft, ArrowRight, RotateCcw, Brain, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = 'initial' | 'simple' | 'advanced';
type SimpleStep = 'objective' | 'audience' | 'tone' | 'style' | 'detail' | 'restrictions' | 'format';
type AdvancedStep = 'objective' | 'context' | 'audience' | 'tone' | 'style' | 'detail' | 'structure' | 'restrictions' | 'keywords' | 'examples' | 'format' | 'additional';
type OutputFormat = 'text' | 'html' | 'json';

interface SimplePromptData {
  objective: string;
  audience: string;
  tone: string;
  style: string;
  detail: string;
  restrictions: string;
  format: string;
}

interface AdvancedPromptData {
  objective: string;
  context: string;
  audience: string;
  tone: string;
  style: string;
  detail: string;
  structure: string;
  restrictions: string;
  keywords: string;
  examples: string;
  format: string;
  additional: string;
}

const PromptBuilder = () => {
  const { toast } = useToast();
  
  // Main state
  const [mode, setMode] = useState<Mode>('initial');
  const [currentSimpleStep, setCurrentSimpleStep] = useState<SimpleStep>('objective');
  const [currentAdvancedStep, setCurrentAdvancedStep] = useState<AdvancedStep>('objective');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  
  // Prompt data for both modes
  const [simpleData, setSimpleData] = useState<SimplePromptData>({
    objective: '',
    audience: '',
    tone: '',
    style: '',
    detail: '',
    restrictions: '',
    format: ''
  });

  const [advancedData, setAdvancedData] = useState<AdvancedPromptData>({
    objective: '',
    context: '',
    audience: '',
    tone: '',
    style: '',
    detail: '',
    structure: '',
    restrictions: '',
    keywords: '',
    examples: '',
    format: '',
    additional: ''
  });

  // Steps configuration for both modes
  const simpleSteps: { key: SimpleStep; title: string; icon: any; explanation: string; example: string }[] = [
    {
      key: 'objective',
      title: 'Objetivo del prompt',
      icon: Target,
      explanation: 'Define el propósito principal de tu prompt.',
      example: 'Quiero que el texto convenza a potenciales clientes para contratar nuestro servicio.'
    },
    {
      key: 'audience',
      title: 'Audiencia',
      icon: Users,
      explanation: 'Selecciona a quién va dirigido el mensaje.',
      example: 'El mensaje debe estar dirigido a jóvenes profesionales interesados en innovación tecnológica.'
    },
    {
      key: 'tone',
      title: 'Tono de voz',
      icon: Volume2,
      explanation: 'Define cómo debe sonar el mensaje.',
      example: 'El texto debe sonar inspirador y optimista.'
    },
    {
      key: 'style',
      title: 'Estilo narrativo',
      icon: Palette,
      explanation: 'Indica el estilo de redacción que prefieres.',
      example: 'Quiero un estilo narrativo tipo storytelling, con una breve historia.'
    },
    {
      key: 'detail',
      title: 'Nivel de detalle',
      icon: Eye,
      explanation: 'Selecciona la profundidad del contenido.',
      example: 'Debe ser un mensaje breve, como un post corto en LinkedIn.'
    },
    {
      key: 'restrictions',
      title: 'Restricciones',
      icon: Shield,
      explanation: 'Indica lo que NO quieres que aparezca.',
      example: 'No quiero que se usen tecnicismos ni un tono excesivamente formal.'
    },
    {
      key: 'format',
      title: 'Formato de salida',
      icon: FileText,
      explanation: 'Selecciona el formato de salida del prompt.',
      example: 'El resultado debe estar en formato de artículo web con encabezados H2.'
    }
  ];

  const advancedSteps: { key: AdvancedStep; title: string; icon: any; explanation: string; example: string }[] = [
    {
      key: 'objective',
      title: 'Objetivo principal',
      icon: Target,
      explanation: 'Define el propósito exacto del prompt.',
      example: 'Quiero que el prompt genere un artículo educativo que explique los beneficios de la IA en el sector legal.'
    },
    {
      key: 'context',
      title: 'Contexto detallado',
      icon: MessageCircle,
      explanation: 'Aporta información de fondo o el escenario.',
      example: 'Este prompt será usado para crear una newsletter sobre tendencias en IA dirigida a directivos.'
    },
    {
      key: 'audience',
      title: 'Audiencia segmentada',
      icon: Users,
      explanation: 'Selecciona el público objetivo en detalle.',
      example: 'Está dirigido a inversores interesados en proyectos de innovación tecnológica.'
    },
    {
      key: 'tone',
      title: 'Tono de voz',
      icon: Volume2,
      explanation: 'Elige el tono o combina varios.',
      example: 'El texto debe sonar profesional y confiable, pero también inspirador.'
    },
    {
      key: 'style',
      title: 'Estilo narrativo',
      icon: Palette,
      explanation: 'Selecciona la manera en que debe estar escrito.',
      example: 'Quiero un estilo técnico, con ejemplos y comparaciones claras.'
    },
    {
      key: 'detail',
      title: 'Nivel de detalle',
      icon: Eye,
      explanation: 'Selecciona la profundidad de la respuesta.',
      example: 'Debe ser un informe extenso con datos técnicos.'
    },
    {
      key: 'structure',
      title: 'Estructura del mensaje',
      icon: Settings2,
      explanation: 'Organiza cómo debe presentarse el contenido.',
      example: 'Debe comenzar con una introducción, luego desarrollar el tema y terminar con una llamada a la acción.'
    },
    {
      key: 'restrictions',
      title: 'Restricciones avanzadas',
      icon: Shield,
      explanation: 'Define lo que debe evitarse.',
      example: 'Evitar lenguaje negativo o términos técnicos demasiado complejos.'
    },
    {
      key: 'keywords',
      title: 'Palabras clave',
      icon: Lightbulb,
      explanation: 'Indica conceptos que deben aparecer.',
      example: 'El texto debe incluir las palabras: innovación, confianza, crecimiento.'
    },
    {
      key: 'examples',
      title: 'Ejemplos de entrada/salida',
      icon: BookOpen,
      explanation: 'Proporciona ejemplos para guiar a la IA.',
      example: 'Input: "Explica qué es la IA generativa en 3 frases sencillas." Output esperado: "La IA generativa crea contenido original como texto o imágenes..."'
    },
    {
      key: 'format',
      title: 'Formato de salida dinámico',
      icon: FileText,
      explanation: 'Define el formato específico de salida.',
      example: 'Genera un post formal de 200 palabras para LinkedIn con emojis limitados.'
    },
    {
      key: 'additional',
      title: 'Opciones adicionales',
      icon: Sparkles,
      explanation: 'Configura extras que ajusten aún más el resultado.',
      example: 'Idioma español, incluir emojis moderadamente, tono semiformal, máximo 300 palabras.'
    }
  ];

  // Options for simple mode
  const simpleOptions = {
    objective: [
      'Informar sobre un tema específico',
      'Persuadir y convencer a la audiencia',
      'Educar paso a paso sobre un concepto',
      'Entretener con contenido atractivo',
      'Inspirar y motivar a la acción',
      'Resolver dudas y preguntas frecuentes',
      'Generar confianza en la marca'
    ],
    audience: [
      'Clientes potenciales interesados en el producto',
      'Inversores que evalúan oportunidades',
      'Empleados internos de la empresa',
      'Público general sin conocimiento técnico',
      'Periodistas y medios especializados',
      'Expertos técnicos del sector',
      'Jóvenes profesionales digitales'
    ],
    tone: [
      'Profesional y corporativo',
      'Cercano y humano',
      'Inspirador y motivacional',
      'Innovador y disruptivo',
      'Confiable y transparente',
      'Dinámico y energético',
      'Cálido y empático'
    ],
    style: [
      'Directo y ejecutivo',
      'Explicativo con detalles',
      'Storytelling narrativo',
      'Técnico especializado',
      'Emocional y persuasivo',
      'Conversacional amigable',
      'Estructurado con bullets'
    ],
    detail: [
      'Breve (menos de 100 palabras)',
      'Intermedio (100-300 palabras)',
      'Profundo (más de 300 palabras)',
      'Extenso con análisis detallado'
    ],
    restrictions: [
      'Evitar jerga técnica compleja',
      'No mencionar competidores directos',
      'Mantener tono neutral políticamente',
      'Evitar promesas exageradas',
      'No incluir información confidencial',
      'Evitar humor o sarcasmo',
      'Mantener brevedad máxima'
    ],
    format: [
      'Post de redes sociales',
      'Artículo de blog corporativo',
      'Email marketing directo',
      'Presentación ejecutiva',
      'Informe técnico formal',
      'Newsletter informativa',
      'Comunicado de prensa'
    ]
  };

  // Options for advanced mode
  const advancedOptions = {
    objective: [
      'Desarrollar estrategia integral de comunicación multicanal',
      'Crear framework de toma de decisiones basado en datos',
      'Diseñar metodología de innovación para equipos multidisciplinarios',
      'Estructurar plan de transformación organizacional por fases',
      'Elaborar análisis competitivo profundo con insights accionables',
      'Construir narrativa de marca coherente y diferenciada',
      'Desarrollar sistema de métricas y KPIs para seguimiento',
      'Crear contenido educativo que simplifique conceptos complejos',
      'Diseñar experiencia de cliente omnicanal y personalizada',
      'Estructurar propuesta comercial irresistible y convincente'
    ],
    context: [
      'Lanzamiento de producto revolucionario en mercado competitivo',
      'Crisis de comunicación que requiere respuesta inmediata y estratégica',
      'Transformación digital de empresa tradicional con resistencia al cambio',
      'Expansión internacional a mercados emergentes con culturas diferentes',
      'Fusión o adquisición empresarial compleja con múltiples stakeholders',
      'Implementación de estrategia de sostenibilidad integral',
      'Cambio generacional en liderazgo con nuevas metodologías',
      'Respuesta a disrupción tecnológica que afecta todo el sector',
      'Recuperación post-crisis con necesidad de rebuilding confianza',
      'Pivote estratégico del modelo de negocio hacia nuevas oportunidades'
    ],
    audience: [
      'C-Level executives y board de directores con poder de decisión',
      'Inversionistas institucionales y venture capital con criterios específicos',
      'Middle management y líderes de equipos en proceso de transformación',
      'Equipos técnicos especializados (developers, data scientists, ingenieros)',
      'Clientes B2B enterprise con procesos de compra complejos y largos',
      'Consumidores millennials y Gen Z digitalmente nativos y exigentes',
      'Profesionales especializados en búsqueda de soluciones específicas',
      'Reguladores gubernamentales y entidades de compliance',
      'Medios de comunicación y periodistas especializados del sector',
      'Comunidad académica e investigadores con rigor científico'
    ],
    tone: [
      'Profesional ejecutivo con autoridad y credibilidad',
      'Cercano y humano manteniendo profesionalismo',
      'Innovador desafiando el status quo con propuestas disruptivas',
      'Inspirador pintando visión de futuro deseable y alcanzable',
      'Optimista transmitiendo confianza en resultados positivos',
      'Dinámico y energético generando momentum y urgencia',
      'Confiable estableciendo expertise y track record comprobado',
      'Transparente admitiendo limitaciones pero ofreciendo soluciones',
      'Disruptivo cuestionando paradigmas existentes',
      'Aspiracional conectando con valores y propósito superior',
      'Cálido estableciendo conexión emocional auténtica',
      'Claro eliminando ambigüedades y malentendidos'
    ],
    style: [
      'Formal institucional con protocolos establecidos',
      'Storytelling emocional con narrativas que conecten',
      'Técnico especializado con datos y evidencia cuantificable',
      'Conversacional consultivo posicionando como experto asesor',
      'Emocional apelando a motivaciones profundas',
      'Creativo utilizando metáforas y analogías poderosas',
      'Educativo construyendo conocimiento paso a paso',
      'Argumentativo con lógica sólida y evidencia contundente',
      'Analítico con deep dive en causas raíz y soluciones',
      'Comparativo estableciendo benchmarks y diferenciación',
      'Persuasivo balanceando lógica y emoción estratégicamente',
      'Minimalista eliminando lo superfluo para máximo impacto'
    ],
    detail: [
      'Muy resumido para executives con tiempo limitado',
      'Medio con balance entre profundidad y accesibilidad',
      'Extenso para análisis completo y toma de decisiones complejas',
      'Técnico detallado para implementación y ejecución específica',
      'Estratégico de alto nivel para visión y dirección',
      'Operacional con pasos concretos y medibles'
    ],
    structure: [
      'Introducción ejecutiva - Desarrollo - Conclusiones - Llamada a la acción',
      'Problema - Análisis - Solución - Implementación - Resultados esperados',
      'Contexto - Oportunidad - Propuesta - Beneficios - Próximos pasos',
      'Situación actual - Visión futura - Roadmap - Recursos necesarios',
      'Desafío - Metodología - Casos de éxito - Aplicación específica',
      'Framework conceptual - Componentes - Interrelaciones - Métricas'
    ],
    restrictions: [
      'Máximo 500 palabras manteniendo densidad informativa alta',
      'Evitar jerga técnica, usar lenguaje accesible para audiencia general',
      'No mencionar competidores directos por restricciones legales',
      'Mantener tono profesional evitando humor o informalidad excesiva',
      'Incluir únicamente información verificable y basada en hechos',
      'Evitar promesas o garantías que no puedan cumplirse legalmente',
      'No revelar información confidencial o estratégica sensible',
      'Mantener neutralidad política y cultural para audiencia global',
      'Evitar sesgos de género, raza o cualquier forma de discriminación',
      'No usar superlativos exagerados que comprometan credibilidad'
    ],
    keywords: [
      'Innovación, transformación, liderazgo, excelencia, crecimiento',
      'Eficiencia, optimización, resultados, performance, ROI',
      'Experiencia, calidad, confianza, expertise, soluciones',
      'Futuro, tendencias, disrupción, oportunidades, evolución',
      'Estrategia, implementación, metodología, framework, sistema',
      'Colaboración, sinergia, partnership, ecosistema, comunidad'
    ],
    examples: [
      'Case study completo de transformación exitosa similar con métricas específicas',
      'Benchmarks de industria con mejores prácticas comprobadas y resultados',
      'Testimonios específicos de clientes con resultados medibles y verificables',
      'Analogías del mundo real que simplifiquen conceptos complejos',
      'Escenarios hipotéticos con diferentes variables y outcomes posibles',
      'Frameworks probados de consultoras top tier (McKinsey, BCG, Bain)',
      'Datos de investigación académica reciente y peer-reviewed',
      'Comparaciones antes/después con métricas específicas y timeline',
      'Ejemplos de competidores exitosos con análisis de factores clave',
      'Modelos mentales y heurísticas de decisión probadas'
    ],
    format: [
      'Artículo de blog SEO-optimizado con estructura H1-H6',
      'Email de newsletter con subject line y preview text',
      'Post de LinkedIn con hooks y hashtags estratégicos',
      'Presentación ejecutiva con talking points clave',
      'Informe técnico con abstract y conclusiones',
      'Comunicado de prensa con titular y quotes',
      'Whitepaper académico con referencias y metodología',
      'Case study con problema-solución-resultados',
      'Propuesta comercial con valor y diferenciación',
      'Script de video con timing y llamadas a la acción'
    ],
    additional: [
      'Español neutro internacional, emojis estratégicos, tono semiformal',
      'Inglés americano, sin emojis, máxima formalidad corporativa',
      'Bilingüe español-inglés, terminología técnica, audiencia global',
      'Lenguaje inclusivo, diversidad cultural, sensibilidad social',
      'Optimizado para SEO con keywords específicas del sector',
      'Formato mobile-first, scannable, bullets y párrafos cortos'
    ]
  };

  // Navigation functions
  const nextSimpleStep = () => {
    const currentIndex = simpleSteps.findIndex(step => step.key === currentSimpleStep);
    if (currentIndex < simpleSteps.length - 1) {
      setCurrentSimpleStep(simpleSteps[currentIndex + 1].key);
    } else {
      generateSimplePrompt();
    }
  };

  const prevSimpleStep = () => {
    const currentIndex = simpleSteps.findIndex(step => step.key === currentSimpleStep);
    if (currentIndex > 0) {
      setCurrentSimpleStep(simpleSteps[currentIndex - 1].key);
    }
  };

  const nextAdvancedStep = () => {
    const currentIndex = advancedSteps.findIndex(step => step.key === currentAdvancedStep);
    if (currentIndex < advancedSteps.length - 1) {
      setCurrentAdvancedStep(advancedSteps[currentIndex + 1].key);
    } else {
      generateAdvancedPrompt();
    }
  };

  const prevAdvancedStep = () => {
    const currentIndex = advancedSteps.findIndex(step => step.key === currentAdvancedStep);
    if (currentIndex > 0) {
      setCurrentAdvancedStep(advancedSteps[currentIndex - 1].key);
    }
  };

  // Progress calculation
  const getSimpleProgress = () => {
    const currentIndex = simpleSteps.findIndex(step => step.key === currentSimpleStep);
    return ((currentIndex + 1) / simpleSteps.length) * 100;
  };

  const getAdvancedProgress = () => {
    const currentIndex = advancedSteps.findIndex(step => step.key === currentAdvancedStep);
    return ((currentIndex + 1) / advancedSteps.length) * 100;
  };

  // Prompt generation functions
  const generateSimplePrompt = () => {
    const sections = [];
    
    if (simpleData.objective) {
      sections.push(`# OBJETIVO\n${simpleData.objective}`);
    }
    
    if (simpleData.audience) {
      sections.push(`# AUDIENCIA\nDirige tu respuesta a: ${simpleData.audience}`);
    }
    
    if (simpleData.tone) {
      sections.push(`# TONO DE VOZ\nUtiliza un tono: ${simpleData.tone}`);
    }
    
    if (simpleData.style) {
      sections.push(`# ESTILO NARRATIVO\nEscribe con un estilo: ${simpleData.style}`);
    }
    
    if (simpleData.detail) {
      sections.push(`# NIVEL DE DETALLE\n${simpleData.detail}`);
    }
    
    if (simpleData.restrictions) {
      sections.push(`# RESTRICCIONES\n${simpleData.restrictions}`);
    }
    
    if (simpleData.format) {
      sections.push(`# FORMATO DE SALIDA\nEstructura el resultado como: ${simpleData.format}`);
    }

    // Add quality guidelines
    sections.push(`# INSTRUCCIONES FINALES\nCrea una respuesta completa y profesional que cumpla con todos los criterios establecidos. Mantén consistencia en el tono y asegúrate de que el contenido sea valioso y relevante para la audiencia objetivo.`);
    
    setGeneratedPrompt(sections.join('\n\n'));
  };

  const generateAdvancedPrompt = () => {
    const sections = [];
    
    if (advancedData.objective) {
      sections.push(`# OBJETIVO PRINCIPAL\n${advancedData.objective}\n\nDesglosa este objetivo en componentes específicos y establece criterios de éxito medibles.`);
    }
    
    if (advancedData.context) {
      sections.push(`# CONTEXTO DETALLADO\n${advancedData.context}\n\nConsidera las implicaciones estratégicas, factores del entorno competitivo y tendencias actuales del mercado.`);
    }
    
    if (advancedData.audience) {
      sections.push(`# AUDIENCIA SEGMENTADA\nDirige tu respuesta específicamente a: ${advancedData.audience}\n\nAdapta el nivel de detalle técnico, lenguaje y ejemplos para maximizar resonancia y comprensión. Considera sus motivaciones principales y procesos de toma de decisión.`);
    }
    
    if (advancedData.tone) {
      sections.push(`# TONO DE VOZ\nUtiliza un tono: ${advancedData.tone}\n\nMantén consistencia tonal a lo largo de toda la respuesta y asegúrate de que refleje los valores de la marca.`);
    }
    
    if (advancedData.style) {
      sections.push(`# ESTILO NARRATIVO\nEscribe con un estilo: ${advancedData.style}\n\nUtiliza transiciones fluidas entre conceptos y estructura la información de manera lógica y progresiva.`);
    }
    
    if (advancedData.detail) {
      sections.push(`# NIVEL DE DETALLE\n${advancedData.detail}\n\nBalancea profundidad con claridad, proporcionando la información necesaria sin abrumar a la audiencia.`);
    }
    
    if (advancedData.structure) {
      sections.push(`# ESTRUCTURA DEL MENSAJE\nOrganiza el contenido siguiendo esta estructura: ${advancedData.structure}\n\nAsegúrate de que cada sección agregue valor único y contribuya al objetivo general.`);
    }
    
    if (advancedData.restrictions) {
      sections.push(`# RESTRICCIONES AVANZADAS\n${advancedData.restrictions}\n\nAdhiérete estrictamente a estas limitaciones mientras maximizas el valor dentro de los parámetros establecidos.`);
    }
    
    if (advancedData.keywords) {
      sections.push(`# PALABRAS CLAVE\nIncorpora naturalmente estos conceptos: ${advancedData.keywords}\n\nIntégra las palabras clave de manera orgánica sin forzar su inclusión.`);
    }
    
    if (advancedData.examples) {
      sections.push(`# EJEMPLOS Y REFERENCIAS\nUtiliza como referencia: ${advancedData.examples}\n\nAplica estos ejemplos para ilustrar puntos clave y proporcionar evidencia concreta.`);
    }
    
    if (advancedData.format) {
      sections.push(`# FORMATO DE SALIDA\nEstructura el resultado como: ${advancedData.format}\n\nSigue las convenciones del formato especificado y optimiza para el canal de distribución.`);
    }
    
    if (advancedData.additional) {
      sections.push(`# CONFIGURACIÓN ADICIONAL\n${advancedData.additional}\n\nAplica estas configuraciones específicas para optimizar el resultado final.`);
    }

    // Add comprehensive methodology
    sections.push(`# METODOLOGÍA DE DESARROLLO\nEstructura tu respuesta utilizando un framework sistemático:\n- Análisis de la situación actual\n- Identificación de oportunidades y desafíos\n- Desarrollo de soluciones específicas\n- Plan de implementación con pasos concretos\n- Métricas de éxito y seguimiento`);
    
    sections.push(`# CRITERIOS DE CALIDAD AVANZADOS\nAsegúrate de que tu respuesta:\n- Proporcione valor inmediato y accionable\n- Esté respaldada por evidencia o mejores prácticas\n- Considere múltiples perspectivas y escenarios\n- Incluya consideraciones de riesgo y mitigación\n- Mantenga equilibrio entre innovación y pragmatismo\n- Demuestre expertise profesional del más alto nivel`);
    
    setGeneratedPrompt(sections.join('\n\n'));
  };

  // Output formatting
  const formatPromptOutput = () => {
    if (!generatedPrompt) return '';
    
    switch (outputFormat) {
      case 'html':
        return generatedPrompt
          .split('\n\n')
          .map(section => {
            if (section.startsWith('#')) {
              const lines = section.split('\n');
              const header = lines[0].replace(/^#+\s*/, '');
              const content = lines.slice(1).join('<br>');
              return `<h2>${header}</h2>\n<p>${content}</p>`;
            }
            return `<p>${section.replace(/\n/g, '<br>')}</p>`;
          })
          .join('\n');
      
      case 'json':
        const sections = generatedPrompt.split('\n\n').map((section, index) => ({
          id: index + 1,
          type: section.startsWith('#') ? 'header' : 'content',
          content: section
        }));
        
        const jsonOutput = {
          prompt: generatedPrompt,
          sections: sections,
          metadata: {
            created: new Date().toISOString(),
            mode: mode,
            outputFormat: outputFormat,
            totalSections: sections.length,
            wordCount: generatedPrompt.split(' ').length
          }
        };
        return JSON.stringify(jsonOutput, null, 2);
      
      default:
        return generatedPrompt;
    }
  };

  // Utility functions
  const copyPrompt = () => {
    const output = formatPromptOutput();
    if (output) {
      navigator.clipboard.writeText(output);
      toast({
        title: "¡Prompt copiado!",
        description: `Prompt copiado en formato ${outputFormat.toUpperCase()}`,
      });
    }
  };

  const resetBuilder = () => {
    setMode('initial');
    setCurrentSimpleStep('objective');
    setCurrentAdvancedStep('objective');
    setOutputFormat('text');
    setGeneratedPrompt('');
    setSimpleData({
      objective: '',
      audience: '',
      tone: '',
      style: '',
      detail: '',
      restrictions: '',
      format: ''
    });
    setAdvancedData({
      objective: '',
      context: '',
      audience: '',
      tone: '',
      style: '',
      detail: '',
      structure: '',
      restrictions: '',
      keywords: '',
      examples: '',
      format: '',
      additional: ''
    });
  };

  // Initial screen
  if (mode === 'initial') {
    return (
      <section id="builder" className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
              <Wand2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
              Prompt Builder Profesional
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
              Crea prompts avanzados paso a paso. Dos modos diseñados para diferentes niveles de personalización y control absoluto sobre el resultado.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group" 
                  onClick={() => setMode('simple')}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Brain className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-green-700">🟢 Prompt Sencillo</CardTitle>
                    <CardDescription className="text-green-600/80">7 pilares de la IA - Rápido y efectivo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "Comienza creando tu prompt paso a paso. Rápido, sencillo y siempre coherente con la marca."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">7 pasos guiados</Badge>
                    <Badge variant="outline" className="text-xs">Opciones predefinidas</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Objetivo, audiencia y tono</li>
                    <li>• Estilo y nivel de detalle</li>
                    <li>• Restricciones y formato</li>
                    <li>• Resultado profesional garantizado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group" 
                  onClick={() => setMode('advanced')}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <Settings2 className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-red-700">🔴 Prompt Avanzado</CardTitle>
                    <CardDescription className="text-red-600/80">Experto - Máxima personalización</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "Diseña un prompt único, ajustado a cada detalle. Control absoluto sobre el resultado."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">12 pasos expandidos</Badge>
                    <Badge variant="outline" className="text-xs">Personalización total</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Contexto detallado y estructura</li>
                    <li>• Keywords y ejemplos específicos</li>
                    <li>• Opciones adicionales avanzadas</li>
                    <li>• Control granular sobre cada aspecto</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Ambos modos incluyen navegación paso a paso, campos opcionales y salida en múltiples formatos
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Simple mode wizard
  if (mode === 'simple') {
    const currentStepData = simpleSteps.find(step => step.key === currentSimpleStep)!;
    const currentIndex = simpleSteps.findIndex(step => step.key === currentSimpleStep);
    const isLastStep = currentIndex === simpleSteps.length - 1;

    return (
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('initial')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold text-green-700">Prompt Sencillo</h1>
              </div>
            </div>
            
            {/* Progress bubbles */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {simpleSteps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isActive ? 'border-green-500 bg-green-500 text-white' : 
                        isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                        'border-muted bg-background text-muted-foreground'}
                    `}>
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full border-2 border-green-300 animate-pulse"></div>
                      )}
                    </div>
                    {index < simpleSteps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 transition-all duration-300 ${
                        index < currentIndex ? 'bg-green-500' : 'bg-muted'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-lg text-muted-foreground">
              Paso {currentIndex + 1} de {simpleSteps.length} • {Math.round(getSimpleProgress())}% completado
            </p>
          </div>

          {/* Step content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <currentStepData.icon className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">{currentStepData.explanation}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-green-500">
                <p className="text-sm font-medium text-muted-foreground mb-2">Ejemplo ilustrativo:</p>
                <p className="text-sm italic">{currentStepData.example}</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Opciones preestablecidas</label>
                  <Select 
                    value={simpleData[currentSimpleStep]} 
                    onValueChange={(value) => setSimpleData(prev => ({ ...prev, [currentSimpleStep]: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {simpleOptions[currentSimpleStep]?.map((option, index) => (
                        <SelectItem key={index} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Personalización libre</label>
                  <Textarea 
                    placeholder="O escribe tu propia versión personalizada..."
                    value={simpleData[currentSimpleStep]}
                    onChange={(e) => setSimpleData(prev => ({ ...prev, [currentSimpleStep]: e.target.value }))}
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevSimpleStep} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button 
              onClick={nextSimpleStep}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isLastStep ? 'Generar Prompt' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
              {isLastStep && <Wand2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Generated prompt preview */}
          {generatedPrompt && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Prompt Generado</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('text')} 
                          className={outputFormat === 'text' ? 'bg-primary text-primary-foreground' : ''}>
                    Texto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('html')}
                          className={outputFormat === 'html' ? 'bg-primary text-primary-foreground' : ''}>
                    HTML
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('json')}
                          className={outputFormat === 'json' ? 'bg-primary text-primary-foreground' : ''}>
                    JSON
                  </Button>
                  <Button size="sm" onClick={copyPrompt}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetBuilder}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{formatPromptOutput()}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    );
  }

  // Advanced mode wizard
  if (mode === 'advanced') {
    const currentStepData = advancedSteps.find(step => step.key === currentAdvancedStep)!;
    const currentIndex = advancedSteps.findIndex(step => step.key === currentAdvancedStep);
    const isLastStep = currentIndex === advancedSteps.length - 1;

    return (
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('initial')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <Settings2 className="h-8 w-8 text-red-600" />
                <h1 className="text-3xl font-bold text-red-700">Prompt Avanzado</h1>
              </div>
            </div>
            
            {/* Progress bubbles */}
            <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
              {advancedSteps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${isActive ? 'border-red-500 bg-red-500 text-white' : 
                        isCompleted ? 'border-red-500 bg-red-500 text-white' : 
                        'border-muted bg-background text-muted-foreground'}
                    `}>
                      <Icon className="h-4 w-4" />
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full border-2 border-red-300 animate-pulse"></div>
                      )}
                    </div>
                    {index < advancedSteps.length - 1 && (
                      <div className={`w-4 h-0.5 mx-1 transition-all duration-300 ${
                        index < currentIndex ? 'bg-red-500' : 'bg-muted'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-lg text-muted-foreground">
              Paso {currentIndex + 1} de {advancedSteps.length} • {Math.round(getAdvancedProgress())}% completado
            </p>
          </div>

          {/* Step content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <currentStepData.icon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">{currentStepData.explanation}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm font-medium text-muted-foreground mb-2">Ejemplo ilustrativo:</p>
                <p className="text-sm italic">{currentStepData.example}</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Opciones preestablecidas</label>
                  <Select 
                    value={advancedData[currentAdvancedStep]} 
                    onValueChange={(value) => setAdvancedData(prev => ({ ...prev, [currentAdvancedStep]: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {advancedOptions[currentAdvancedStep]?.map((option, index) => (
                        <SelectItem key={index} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Personalización libre</label>
                  <Textarea 
                    placeholder="O escribe tu propia versión personalizada con máximo detalle..."
                    value={advancedData[currentAdvancedStep]}
                    onChange={(e) => setAdvancedData(prev => ({ ...prev, [currentAdvancedStep]: e.target.value }))}
                    className="mt-2"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevAdvancedStep} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button 
              onClick={nextAdvancedStep}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              {isLastStep ? 'Generar Prompt' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
              {isLastStep && <Wand2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Generated prompt preview */}
          {generatedPrompt && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Prompt Generado</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('text')} 
                          className={outputFormat === 'text' ? 'bg-primary text-primary-foreground' : ''}>
                    Texto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('html')}
                          className={outputFormat === 'html' ? 'bg-primary text-primary-foreground' : ''}>
                    HTML
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('json')}
                          className={outputFormat === 'json' ? 'bg-primary text-primary-foreground' : ''}>
                    JSON
                  </Button>
                  <Button size="sm" onClick={copyPrompt}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetBuilder}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{formatPromptOutput()}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    );
  }

  return null;
};

export default PromptBuilder;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Copy, Wand2, RefreshCw, ChevronLeft, ChevronRight, User, Target, Users, Volume2, Palette, BookOpen, Shield, MessageCircle, FileText, Settings2, Globe, Eye, Sparkles, ArrowLeft, ArrowRight, RotateCcw, Brain, Lightbulb, Plus, X } from "lucide-react";
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
  audience: string[];
  tone: string[];
  style: string[];
  detail: string;
  structure: string[];
  restrictions: string[];
  keywords: string[];
  examples: string[];
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
  const [newItemInput, setNewItemInput] = useState('');
  
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
    audience: [],
    tone: [],
    style: [],
    detail: '',
    structure: [],
    restrictions: [],
    keywords: [],
    examples: [],
    format: '',
    additional: ''
  });

  // Helper function to check if a field is an array field
  const isArrayField = (step: AdvancedStep): boolean => {
    return ['audience', 'tone', 'style', 'structure', 'restrictions', 'keywords', 'examples'].includes(step);
  };

  // Helper function to get current value for advanced steps
  const getAdvancedValue = (step: AdvancedStep): string | string[] => {
    return advancedData[step];
  };

  // Helper function to set advanced value
  const setAdvancedValue = (step: AdvancedStep, value: string | string[]) => {
    setAdvancedData(prev => ({ ...prev, [step]: value }));
  };

  // Functions to handle dynamic arrays
  const addToAdvancedArray = (step: AdvancedStep, value: string) => {
    if (isArrayField(step) && value.trim()) {
      const currentArray = advancedData[step] as string[];
      if (!currentArray.includes(value.trim())) {
        setAdvancedData(prev => ({
          ...prev,
          [step]: [...currentArray, value.trim()]
        }));
      }
    }
  };

  const removeFromAdvancedArray = (step: AdvancedStep, index: number) => {
    if (isArrayField(step)) {
      const currentArray = advancedData[step] as string[];
      setAdvancedData(prev => ({
        ...prev,
        [step]: currentArray.filter((_, i) => i !== index)
      }));
    }
  };

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

  const advancedSteps: { key: AdvancedStep; title: string; icon: any; explanation: string; example: string; dynamicButton?: string }[] = [
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
      example: 'Está dirigido a inversores interesados en proyectos de innovación tecnológica.',
      dynamicButton: '+ Añadir otra audiencia'
    },
    {
      key: 'tone',
      title: 'Tono de voz',
      icon: Volume2,
      explanation: 'Elige el tono o combina varios.',
      example: 'El texto debe sonar profesional y confiable, pero también inspirador.',
      dynamicButton: '+ Añadir otro tono'
    },
    {
      key: 'style',
      title: 'Estilo narrativo',
      icon: Palette,
      explanation: 'Selecciona la manera en que debe estar escrito.',
      example: 'Quiero un estilo técnico, con ejemplos y comparaciones claras.',
      dynamicButton: '+ Añadir otro estilo'
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
      example: 'Debe comenzar con una introducción, luego desarrollar el tema y terminar con una llamada a la acción.',
      dynamicButton: '+ Añadir otro bloque de estructura'
    },
    {
      key: 'restrictions',
      title: 'Restricciones avanzadas',
      icon: Shield,
      explanation: 'Define lo que debe evitarse.',
      example: 'Evitar lenguaje negativo o términos técnicos demasiado complejos.',
      dynamicButton: '+ Añadir otra restricción'
    },
    {
      key: 'keywords',
      title: 'Palabras clave',
      icon: Lightbulb,
      explanation: 'Indica conceptos que deben aparecer.',
      example: 'El texto debe incluir las palabras: innovación, confianza, crecimiento.',
      dynamicButton: '+ Añadir otra palabra clave'
    },
    {
      key: 'examples',
      title: 'Ejemplos de entrada/salida',
      icon: BookOpen,
      explanation: 'Proporciona ejemplos para guiar a la IA.',
      example: 'Input: "Explica qué es la IA generativa en 3 frases sencillas." Output esperado: "La IA generativa crea contenido original como texto o imágenes..."',
      dynamicButton: '+ Añadir otro ejemplo'
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

  // Enhanced prompt generation functions with more sophisticated templates
  const generateSimplePrompt = () => {
    const promptSections = [];
    
    // Build opening statement
    const openingTemplate = "Actúa como un experto profesional especializado en comunicación estratégica y copywriting de alto nivel.";
    promptSections.push(`# ROL Y EXPERTISE\n${openingTemplate}`);
    
    if (simpleData.objective) {
      const objectiveTemplate = `Tu misión específica es: ${simpleData.objective}. 
      
Para esto, debes desarrollar una estrategia de comunicación que maximice el impacto y genere los resultados deseados, aplicando las mejores prácticas de persuasión ética y comunicación efectiva.`;
      promptSections.push(`# OBJETIVO ESTRATÉGICO\n${objectiveTemplate}`);
    }
    
    if (simpleData.audience) {
      const audienceTemplate = `Tu mensaje debe estar perfectamente adaptado para: ${simpleData.audience}.

Considera profundamente:
- Sus motivaciones principales y puntos de dolor específicos
- Su nivel de conocimiento técnico y vocabulario apropiado
- Sus procesos de toma de decisión y factores influyentes
- El contexto en el que consumirán tu mensaje
- Sus expectativas y prejuicios sobre el tema`;
      promptSections.push(`# AUDIENCIA OBJETIVO\n${audienceTemplate}`);
    }
    
    if (simpleData.tone) {
      const toneTemplate = `Mantén un tono consistentemente: ${simpleData.tone}.

Este tono debe reflejarse en:
- La elección de vocabulario y estructura de frases
- El nivel de formalidad y proximidad emocional
- Los ejemplos y referencias que uses
- La cadencia y ritmo del texto
- La personalidad de marca que proyectes`;
      promptSections.push(`# TONO DE COMUNICACIÓN\n${toneTemplate}`);
    }
    
    if (simpleData.style) {
      const styleTemplate = `Utiliza un estilo narrativo: ${simpleData.style}.

Aplica las siguientes técnicas:
- Estructura la información de manera lógica y progresiva
- Utiliza transiciones fluidas entre conceptos
- Incorpora elementos que mantengan el engagement
- Balancea información y narrativa de manera efectiva
- Crea conexión emocional apropiada para el objetivo`;
      promptSections.push(`# ESTILO NARRATIVO\n${styleTemplate}`);
    }
    
    if (simpleData.detail) {
      const detailTemplate = `El nivel de profundidad debe ser: ${simpleData.detail}.

Considera:
- La capacidad de atención de tu audiencia
- El contexto de consumo del contenido
- El balance óptimo entre completitud y accesibilidad
- La inclusión de ejemplos y evidencia de apoyo
- La densidad informativa apropiada`;
      promptSections.push(`# NIVEL DE DETALLE\n${detailTemplate}`);
    }
    
    if (simpleData.restrictions) {
      const restrictionsTemplate = `IMPORTANTE - Restricciones obligatorias: ${simpleData.restrictions}.

Adhiérete estrictamente a estas limitaciones mientras:
- Maximizas el valor dentro de los parámetros establecidos
- Encuentras alternativas creativas que respeten las restricciones
- Mantienes la efectividad del mensaje
- Aseguras el cumplimiento total de las directrices`;
      promptSections.push(`# RESTRICCIONES CRÍTICAS\n${restrictionsTemplate}`);
    }
    
    if (simpleData.format) {
      const formatTemplate = `Estructura y presenta el resultado como: ${simpleData.format}.

Optimiza para:
- Las convenciones específicas del formato elegido
- La experiencia de usuario en el canal de distribución
- Los elementos visuales y de diseño apropiados
- La scanabilidad y facilidad de consumo
- Las mejores prácticas del medio específico`;
      promptSections.push(`# FORMATO Y PRESENTACIÓN\n${formatTemplate}`);
    }

    // Add comprehensive methodology
    const methodologyTemplate = `Desarrolla tu respuesta siguiendo esta metodología sistemática:

1. **ANÁLISIS INICIAL**: Comprende profundamente la situación, contexto y necesidades
2. **ESTRATEGIA**: Define el enfoque más efectivo para alcanzar el objetivo
3. **DESARROLLO**: Crea el contenido aplicando las mejores prácticas
4. **OPTIMIZACIÓN**: Refina el mensaje para máximo impacto
5. **VALIDACIÓN**: Asegura coherencia con todos los criterios establecidos`;
    promptSections.push(`# METODOLOGÍA DE TRABAJO\n${methodologyTemplate}`);
    
    const qualityTemplate = `Tu respuesta debe demostrar:
- **Expertise profesional** del más alto nivel en comunicación estratégica
- **Valor inmediato** que pueda aplicarse directamente
- **Coherencia total** con la marca y objetivos establecidos
- **Innovación** que diferencie del contenido estándar
- **Impacto medible** en la audiencia objetivo
- **Calidad premium** que refleje estándares corporativos de excelencia`;
    promptSections.push(`# ESTÁNDARES DE CALIDAD\n${qualityTemplate}`);
    
    setGeneratedPrompt(promptSections.join('\n\n'));
  };

  const generateAdvancedPrompt = () => {
    const promptSections = [];
    
    // Enhanced opening for advanced mode
    const advancedOpeningTemplate = `Actúa como un consultor estratégico senior con expertise multidisciplinario en comunicación corporativa, psicología del consumidor, marketing estratégico y análisis de audiencias. Tu enfoque debe ser sistemático, basado en evidencia y orientado a resultados medibles.`;
    promptSections.push(`# ROL ESPECIALIZADO Y EXPERTISE\n${advancedOpeningTemplate}`);
    
    if (advancedData.objective) {
      const objectiveTemplate = `Tu objetivo estratégico es: ${advancedData.objective}

Desglosa este objetivo en:
- **Componentes específicos** y deliverables concretos
- **Criterios de éxito** medibles y verificables
- **Métricas de impacto** relevantes para el negocio
- **Benchmarks de rendimiento** contra mejores prácticas
- **Timeline de resultados** esperados y milestone clave
- **Análisis de riesgo** y planes de contingencia`;
      promptSections.push(`# OBJETIVO ESTRATÉGICO AVANZADO\n${objectiveTemplate}`);
    }
    
    if (advancedData.context) {
      const contextTemplate = `Contexto estratégico detallado: ${advancedData.context}

Analiza y considera:
- **Factores macroeconómicos** y tendencias del sector
- **Landscape competitivo** y positioning relativo
- **Timing de mercado** y window of opportunity
- **Stakeholders clave** y sus motivaciones específicas
- **Recursos disponibles** y limitaciones operacionales
- **Implicaciones regulatorias** y compliance requirements
- **Cultural context** y sensibilidades regionales`;
      promptSections.push(`# ANÁLISIS CONTEXTUAL PROFUNDO\n${contextTemplate}`);
    }
    
    if (advancedData.audience.length > 0) {
      const audienceTemplate = `Audiencias objetivo segmentadas: ${advancedData.audience.join(', ')}

Para cada segmento, desarrolla:
- **Perfil psicográfico detallado** con motivaciones profundas
- **Customer journey mapping** con touchpoints críticos
- **Pain points específicos** y job-to-be-done framework
- **Decision-making process** y influenciadores clave
- **Communication preferences** y canales preferidos
- **Messaging hierarchy** personalizado por segmento
- **Personalization strategy** para máxima resonancia`;
      promptSections.push(`# SEGMENTACIÓN DE AUDIENCIA AVANZADA\n${audienceTemplate}`);
    }
    
    if (advancedData.tone.length > 0) {
      const toneTemplate = `Combinación tonal estratégica: ${advancedData.tone.join(' + ')}

Implementa una arquitectura tonal que:
- **Establezca jerarquía** entre los diferentes tonos
- **Adapte dinámicamente** según el contexto del mensaje
- **Mantenga consistencia** de marca a lo largo del customer journey
- **Genere emotional engagement** apropiado para cada audiencia
- **Refleje valores corporativos** de manera auténtica
- **Diferencie competitivamente** en el mercado`;
      promptSections.push(`# ARQUITECTURA TONAL SOFISTICADA\n${toneTemplate}`);
    }
    
    if (advancedData.style.length > 0) {
      const styleTemplate = `Framework estilístico integrado: ${advancedData.style.join(' + ')}

Combina estos estilos para:
- **Crear narrative arc** compelling y memorable
- **Optimizar information architecture** para comprensión
- **Integrar storytelling elements** con data-driven insights
- **Balancear emotion y logic** según objetivos específicos
- **Implementar persuasion techniques** éticas y efectivas
- **Asegurar scalability** del approach a otros contenidos`;
      promptSections.push(`# FRAMEWORK ESTILÍSTICO AVANZADO\n${styleTemplate}`);
    }
    
    if (advancedData.detail) {
      const detailTemplate = `Profundidad analítica: ${advancedData.detail}

Estructura el contenido con:
- **Executive summary** para quick consumption
- **Detailed analysis** con supporting evidence
- **Actionable insights** y next steps concretos
- **Supporting data** y statistical validation
- **Expert opinions** y third-party validation
- **Implementation roadmap** con timeline específico`;
      promptSections.push(`# ARQUITECTURA DE INFORMACIÓN\n${detailTemplate}`);
    }
    
    if (advancedData.structure.length > 0) {
      const structureTemplate = `Estructura de contenido optimizada: ${advancedData.structure.join(' → ')}

Cada sección debe:
- **Agregar valor único** y diferenciado
- **Contribuir al objetivo** general de manera medible
- **Mantener engagement** y flow natural
- **Incluir transition elements** que conecten ideas
- **Incorporar proof points** y credibility markers
- **Facilitar easy scanning** y quick reference`;
      promptSections.push(`# ARQUITECTURA ESTRUCTURAL\n${structureTemplate}`);
    }
    
    if (advancedData.restrictions.length > 0) {
      const restrictionsTemplate = `Restricciones operacionales críticas:
${advancedData.restrictions.map(r => `• ${r}`).join('\n')}

Cumplimiento obligatorio:
- **Adherencia estricta** a todas las limitaciones establecidas
- **Creative solutions** dentro de los parámetros definidos
- **Risk mitigation** para evitar violaciones
- **Quality assurance** con compliance checklist
- **Legal review** considerations para contenido público
- **Brand guidelines** alignment verification`;
      promptSections.push(`# COMPLIANCE Y RESTRICCIONES\n${restrictionsTemplate}`);
    }
    
    if (advancedData.keywords.length > 0) {
      const keywordsTemplate = `Keywords estratégicas para integración orgánica:
${advancedData.keywords.map(k => `• ${k}`).join('\n')}

Implementación SEO-optimizada:
- **Natural integration** sin keyword stuffing
- **Semantic variations** y related terms
- **Context relevance** para search intent
- **Long-tail opportunities** para nicho targeting
- **Content clusters** y topic authority building
- **User intent matching** con search behavior`;
      promptSections.push(`# ESTRATEGIA DE KEYWORDS\n${keywordsTemplate}`);
    }
    
    if (advancedData.examples.length > 0) {
      const examplesTemplate = `Referencias y ejemplos para benchmarking:
${advancedData.examples.map(e => `• ${e}`).join('\n')}

Utiliza estos ejemplos para:
- **Illustrate complex concepts** con analogías efectivas
- **Provide social proof** y third-party validation
- **Demonstrate practical application** de los conceptos
- **Set performance benchmarks** y success metrics
- **Show before/after scenarios** con outcomes medibles
- **Create aspirational vision** de resultados posibles`;
      promptSections.push(`# EJEMPLOS Y BENCHMARKING\n${examplesTemplate}`);
    }
    
    if (advancedData.format) {
      const formatTemplate = `Especificaciones de formato: ${advancedData.format}

Optimización específica:
- **Platform-native optimization** para máximo rendimiento
- **User experience design** considerations
- **Accessibility standards** y inclusive design
- **Mobile-first approach** con responsive elements
- **Engagement optimization** específica del canal
- **Conversion path design** hacia objetivos definidos
- **A/B testing framework** para continuous improvement`;
      promptSections.push(`# OPTIMIZACIÓN DE FORMATO\n${formatTemplate}`);
    }
    
    if (advancedData.additional) {
      const additionalTemplate = `Configuraciones especializadas: ${advancedData.additional}

Implementación avanzada:
- **Cultural adaptation** y localization strategy
- **Technical specifications** y platform requirements  
- **Brand voice calibration** específica del canal
- **Performance metrics** y success tracking
- **Iterative improvement** based on data analysis
- **Scalability planning** para future applications`;
      promptSections.push(`# CONFIGURACIÓN ESPECIALIZADA\n${additionalTemplate}`);
    }

    // Advanced methodology
    const advancedMethodologyTemplate = `Metodología de desarrollo estratégico:

**FASE 1: ANÁLISIS PROFUNDO**
- Situational analysis con framework SWOT expandido
- Competitive intelligence y market positioning
- Audience research y behavioral insights
- Channel optimization y media planning

**FASE 2: ESTRATEGIA INTEGRADA**
- Message architecture y hierarchy definition
- Content strategy roadmap con timeline
- Channel mix optimization y budget allocation
- KPI framework y measurement plan

**FASE 3: EJECUCIÓN PREMIUM**
- Content creation con quality assurance
- Cross-platform adaptation y optimization
- Stakeholder alignment y approval process  
- Performance monitoring y real-time adjustment

**FASE 4: OPTIMIZACIÓN CONTINUA**
- Data analysis y insight extraction
- Performance benchmarking contra objectives
- Iterative improvement recommendations
- Scaling strategy para future applications`;
    promptSections.push(`# METODOLOGÍA ESTRATÉGICA AVANZADA\n${advancedMethodologyTemplate}`);
    
    const premiumQualityTemplate = `Estándares de excelencia corporativa:

Tu deliverable debe demostrar:
- **Strategic thinking** de nivel C-suite con business acumen
- **Data-driven insights** con quantitative backing
- **Innovation leadership** que establezca new benchmarks
- **Operational excellence** en execution y delivery
- **Stakeholder management** skills en communication
- **ROI optimization** con clear value proposition
- **Risk management** con contingency planning
- **Scalability planning** para enterprise deployment
- **Competitive differentiation** que genere sustainable advantage
- **Brand elevation** que refuerce market positioning`;
    promptSections.push(`# ESTÁNDARES DE EXCELENCIA CORPORATIVA\n${premiumQualityTemplate}`);
    
    setGeneratedPrompt(promptSections.join('\n\n'));
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
            wordCount: generatedPrompt.split(' ').length,
            configuration: mode === 'simple' ? simpleData : advancedData
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
    setNewItemInput('');
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
      audience: [],
      tone: [],
      style: [],
      detail: '',
      structure: [],
      restrictions: [],
      keywords: [],
      examples: [],
      format: '',
      additional: ''
    });
  };

  // Initial screen
  if (mode === 'initial') {
    return (
      <section id="builder" className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 animate-scale-in">
              <Wand2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6 animate-fade-in">
              Prompt Maestro
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in delay-200">
              Constructor de prompts avanzado y dinámico en dos modos. Crea prompts profesionales paso a paso con máxima personalización y control absoluto sobre el resultado.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in delay-300">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group hover-scale" 
                  onClick={() => setMode('simple')}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 transition-transform duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-500/10 rounded-lg transition-colors duration-300">
                    <Brain className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-red-700">Prompt Sencillo</CardTitle>
                    <CardDescription className="text-red-600/80">7 pilares de la IA - Rápido y efectivo</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "Crea tu prompt en pocos pasos. Rápido, sencillo y siempre coherente con la marca."
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

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group hover-scale" 
                  onClick={() => setMode('advanced')}>
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative z-10 transition-transform duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-500/10 rounded-lg transition-colors duration-300">
                    <Settings2 className="h-8 w-8 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-red-700">Prompt Avanzado</CardTitle>
                    <CardDescription className="text-red-600/80">Experto - Máxima personalización</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "Diseña un prompt único, con control absoluto sobre cada detalle. Personaliza y ajusta hasta el mínimo matiz."
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">12 pasos expandidos</Badge>
                    <Badge variant="outline" className="text-xs">Dinámicas interactivas</Badge>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Contexto detallado y estructura</li>
                    <li>• Keywords y ejemplos específicos</li>
                    <li>• Botones dinámicos "+ Añadir"</li>
                    <li>• Control granular sobre cada aspecto</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12 animate-fade-in delay-500">
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
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-screen animate-fade-in">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-right">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('initial')} className="transition-all duration-300 hover:scale-105">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <Brain className="h-8 w-8 text-red-600 animate-scale-in" />
                <h1 className="text-3xl font-bold text-red-700">Prompt Sencillo</h1>
              </div>
            </div>
            
            {/* Progress bubbles */}
            <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in delay-200">
              {simpleSteps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 hover-scale
                      ${isActive ? 'border-red-500 bg-red-500 text-white animate-scale-in' : 
                        isCompleted ? 'border-red-500 bg-red-500 text-white' : 
                        'border-muted bg-background text-muted-foreground'}
                    `}>
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full border-2 border-red-300 animate-pulse"></div>
                      )}
                    </div>
                    {index < simpleSteps.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 transition-all duration-500 ${
                        index < currentIndex ? 'bg-red-500' : 'bg-muted'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-lg text-muted-foreground animate-fade-in delay-300">
              Paso {currentIndex + 1} de {simpleSteps.length} • {Math.round(getSimpleProgress())}% completado
            </p>
          </div>

          {/* Step content */}
          <Card className="mb-8 animate-scale-in transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg animate-scale-in delay-100">
                  <currentStepData.icon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl animate-fade-in delay-200">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-lg mt-2 animate-fade-in delay-300">{currentStepData.explanation}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 animate-fade-in delay-400">
              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-red-500 transition-all duration-300 hover:bg-muted/70">
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
                    <SelectTrigger className="mt-2 transition-all duration-300 hover:border-red-300">
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
                    className="mt-2 transition-all duration-300 hover:border-red-300 focus:border-red-500"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between animate-fade-in delay-500">
            <Button 
              variant="outline" 
              onClick={prevSimpleStep} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button 
              onClick={nextSimpleStep}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
            >
              {isLastStep ? 'Generar Prompt' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
              {isLastStep && <Wand2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Generated prompt preview */}
          {generatedPrompt && (
            <Card className="mt-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Prompt Generado</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('text')} 
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'text' ? 'bg-primary text-primary-foreground' : ''}`}>
                    Texto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('html')}
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'html' ? 'bg-primary text-primary-foreground' : ''}`}>
                    HTML
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('json')}
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'json' ? 'bg-primary text-primary-foreground' : ''}`}>
                    JSON
                  </Button>
                  <Button size="sm" onClick={copyPrompt} className="transition-all duration-300 hover:scale-105">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetBuilder} className="transition-all duration-300 hover:scale-105">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg transition-all duration-300 hover:bg-muted/80">
                  <pre className="whitespace-pre-wrap text-sm font-mono">{formatPromptOutput()}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    );
  }

  // Advanced mode wizard with dynamic buttons
  if (mode === 'advanced') {
    const currentStepData = advancedSteps.find(step => step.key === currentAdvancedStep)!;
    const currentIndex = advancedSteps.findIndex(step => step.key === currentAdvancedStep);
    const isLastStep = currentIndex === advancedSteps.length - 1;
    const isCurrentFieldArray = isArrayField(currentAdvancedStep);

    const handleAddNewItem = () => {
      if (newItemInput.trim() && isArrayField(currentAdvancedStep)) {
        addToAdvancedArray(currentAdvancedStep, newItemInput.trim());
        setNewItemInput('');
      }
    };

    const handleSelectPredefined = (value: string) => {
      if (isArrayField(currentAdvancedStep)) {
        addToAdvancedArray(currentAdvancedStep, value);
      } else {
        setAdvancedValue(currentAdvancedStep, value);
      }
    };

    const getCurrentArrayValue = (): string[] => {
      if (isArrayField(currentAdvancedStep)) {
        return advancedData[currentAdvancedStep] as string[];
      }
      return [];
    };

    const getCurrentStringValue = (): string => {
      if (!isArrayField(currentAdvancedStep)) {
        return advancedData[currentAdvancedStep] as string;
      }
      return '';
    };

    return (
      <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 min-h-screen animate-fade-in">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in-right">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setMode('initial')} className="transition-all duration-300 hover:scale-105">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <Settings2 className="h-8 w-8 text-red-600 animate-scale-in" />
                <h1 className="text-3xl font-bold text-red-700">Prompt Avanzado</h1>
              </div>
            </div>
            
            {/* Progress bubbles */}
            <div className="flex items-center justify-center gap-1 mb-8 flex-wrap animate-fade-in delay-200">
              {advancedSteps.map((step, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                const Icon = step.icon;
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`
                      relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 hover-scale
                      ${isActive ? 'border-red-500 bg-red-500 text-white animate-scale-in' : 
                        isCompleted ? 'border-red-500 bg-red-500 text-white' : 
                        'border-muted bg-background text-muted-foreground'}
                    `}>
                      <Icon className="h-4 w-4" />
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full border-2 border-red-300 animate-pulse"></div>
                      )}
                    </div>
                    {index < advancedSteps.length - 1 && (
                      <div className={`w-4 h-0.5 mx-1 transition-all duration-500 ${
                        index < currentIndex ? 'bg-red-500' : 'bg-muted'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-lg text-muted-foreground animate-fade-in delay-300">
              Paso {currentIndex + 1} de {advancedSteps.length} • {Math.round(getAdvancedProgress())}% completado
            </p>
          </div>

          {/* Step content */}
          <Card className="mb-8 animate-scale-in transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg animate-scale-in delay-100">
                  <currentStepData.icon className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl animate-fade-in delay-200">{currentStepData.title}</CardTitle>
                  <CardDescription className="text-lg mt-2 animate-fade-in delay-300">{currentStepData.explanation}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 animate-fade-in delay-400">
              {/* Example */}
              <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-red-500 transition-all duration-300 hover:bg-muted/70">
                <p className="text-sm font-medium text-muted-foreground mb-2">Ejemplo ilustrativo:</p>
                <p className="text-sm italic">{currentStepData.example}</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Opciones preestablecidas</label>
                  <Select onValueChange={handleSelectPredefined}>
                    <SelectTrigger className="mt-2 transition-all duration-300 hover:border-red-300">
                      <SelectValue placeholder="Selecciona una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {advancedOptions[currentAdvancedStep]?.map((option, index) => (
                        <SelectItem key={index} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Array fields with dynamic buttons */}
                {isCurrentFieldArray ? (
                  <div className="space-y-4">
                    {/* Current items */}
                    {getCurrentArrayValue().length > 0 && (
                      <div>
                        <label className="text-sm font-medium">Elementos seleccionados:</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getCurrentArrayValue().map((item, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
                              {item}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-300"
                                onClick={() => removeFromAdvancedArray(currentAdvancedStep, index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add new item */}
                    <div>
                      <label className="text-sm font-medium">{currentStepData.dynamicButton}</label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Escribe y presiona + para añadir..."
                          value={newItemInput}
                          onChange={(e) => setNewItemInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewItem();
                            }
                          }}
                          className="transition-all duration-300 hover:border-red-300 focus:border-red-500"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddNewItem}
                          disabled={!newItemInput.trim()}
                          className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* String fields */
                  <div>
                    <label className="text-sm font-medium">Personalización libre</label>
                    <Textarea 
                      placeholder="O escribe tu propia versión personalizada con máximo detalle..."
                      value={getCurrentStringValue()}
                      onChange={(e) => setAdvancedValue(currentAdvancedStep, e.target.value)}
                      className="mt-2 transition-all duration-300 hover:border-red-300 focus:border-red-500"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between animate-fade-in delay-500">
            <Button 
              variant="outline" 
              onClick={prevAdvancedStep} 
              disabled={currentIndex === 0}
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <Button 
              onClick={nextAdvancedStep}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
            >
              {isLastStep ? 'Generar Prompt' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
              {isLastStep && <Wand2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Generated prompt preview */}
          {generatedPrompt && (
            <Card className="mt-8 animate-fade-in">
              <CardHeader>
                <CardTitle>Prompt Generado</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('text')} 
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'text' ? 'bg-primary text-primary-foreground' : ''}`}>
                    Texto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('html')}
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'html' ? 'bg-primary text-primary-foreground' : ''}`}>
                    HTML
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setOutputFormat('json')}
                          className={`transition-all duration-300 hover:scale-105 ${outputFormat === 'json' ? 'bg-primary text-primary-foreground' : ''}`}>
                    JSON
                  </Button>
                  <Button size="sm" onClick={copyPrompt} className="transition-all duration-300 hover:scale-105">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetBuilder} className="transition-all duration-300 hover:scale-105">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg transition-all duration-300 hover:bg-muted/80">
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
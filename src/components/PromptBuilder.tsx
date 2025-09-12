import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2, RefreshCw, Settings, ChevronLeft, ChevronRight, Play, User, FileText, Target, Users, Layout, BookOpen, Shield, Code, FileCode, Settings2, Heart, Zap, Star, Lightbulb, MessageCircle, Volume2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = 'initial' | 'simple' | 'advanced';
type Step = 'role' | 'context' | 'task' | 'audience' | 'format' | 'examples' | 'restrictions';
type OutputFormat = 'text' | 'html' | 'json';

interface PromptData {
  role: string;
  context: string;
  task: string;
  audience: string;
  format: string;
  examples: string;
  restrictions: string;
}

const PromptBuilder = () => {
  const { toast } = useToast();
  
  // Main state
  const [mode, setMode] = useState<Mode>('initial');
  const [currentStep, setCurrentStep] = useState<Step>('role');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  
  // Prompt data
  const [promptData, setPromptData] = useState<PromptData>({
    role: '',
    context: '',
    task: '',
    audience: '',
    format: '',
    examples: '',
    restrictions: ''
  });

  // Los 7 pilares del prompt engineering
  const steps: { key: Step; title: string; icon: any; required: boolean }[] = [
    { key: 'role', title: 'Rol', icon: User, required: false },
    { key: 'context', title: 'Contexto', icon: MessageCircle, required: false },
    { key: 'task', title: 'Tarea', icon: Target, required: false },
    { key: 'audience', title: 'Audiencia', icon: Users, required: false },
    { key: 'format', title: 'Formato', icon: Palette, required: false },
    { key: 'examples', title: 'Ejemplos', icon: BookOpen, required: false },
    { key: 'restrictions', title: 'Restricciones', icon: Shield, required: false }
  ];

  // Comprehensive options for brand voice and style
  const brandOptions = {
    role: [
      'Experto en marketing digital con 15+ años de experiencia',
      'Consultor estratégico de negocios especializado en transformación',
      'Profesor universitario y investigador con doctorado',
      'Escritor profesional y copywriter creativo',
      'Analista de datos senior con experiencia en IA',
      'Especialista en comunicación corporativa y relaciones públicas',
      'Coach ejecutivo y mentor de liderazgo',
      'Psicólogo organizacional especializado en comportamiento',
      'Experto en experiencia de usuario (UX) y diseño centrado en humanos',
      'Consultor en innovación y metodologías ágiles',
      'Especialista en branding y posicionamiento estratégico',
      'Experto en ventas B2B con track record comprobado',
      'Investigador de mercado y tendencias de consumo',
      'Especialista en transformación digital y tecnología',
      'Experto en sostenibilidad y responsabilidad social corporativa',
      'Consultor financiero y analista de inversiones',
      'Especialista en recursos humanos y desarrollo del talento',
      'Experto en e-commerce y marketing de performance',
      'Consultor en procesos y optimización operacional',
      'Experto en inteligencia artificial y machine learning'
    ],
    context: [
      'Lanzamiento de producto revolucionario en mercado competitivo',
      'Crisis de comunicación que requiere respuesta inmediata',
      'Transformación digital de empresa tradicional',
      'Expansión internacional a nuevos mercados emergentes',
      'Fusión o adquisición empresarial compleja',
      'Implementación de estrategia de sostenibilidad integral',
      'Cambio generacional en el liderazgo de la compañía',
      'Respuesta a disrupción tecnológica del sector',
      'Recuperación post-crisis económica o sanitaria',
      'Pivote estratégico del modelo de negocio',
      'Innovación disruptiva que cambia las reglas del juego',
      'Compliance con nuevas regulaciones gubernamentales',
      'Optimización de procesos internos para eficiencia',
      'Construcción de cultura corporativa en equipo remoto',
      'Desarrollo de propuesta de valor diferenciada',
      'Gestión de stakeholders en proyecto de alto impacto',
      'Implementación de tecnologías emergentes (IA, blockchain)',
      'Estrategia de retención de talento en mercado competitivo',
      'Comunicación de resultados financieros desafiantes',
      'Posicionamiento como líder de pensamiento en la industria'
    ],
    task: [
      'Desarrollar estrategia integral de comunicación multicanal',
      'Crear framework de toma de decisiones basado en datos',
      'Diseñar metodología de innovación para equipos multidisciplinarios',
      'Estructurar plan de transformación organizacional por fases',
      'Elaborar análisis competitivo profundo con insights accionables',
      'Construir narrativa de marca coherente y diferenciada',
      'Desarrollar sistema de métricas y KPIs para seguimiento',
      'Crear contenido educativo que simplifique conceptos complejos',
      'Diseñar experiencia de cliente omnicanal y personalizada',
      'Estructurar propuesta comercial irresistible y convincente',
      'Elaborar roadmap tecnológico alineado con objetivos de negocio',
      'Crear programa de desarrollo de liderazgo interno',
      'Diseñar estrategia de posicionamiento en mercados emergentes',
      'Desarrollar modelo de pricing dinámico y competitivo',
      'Estructurar plan de gestión de crisis con protocolos claros',
      'Crear sistema de feedback 360° para mejora continua',
      'Elaborar business case sólido para inversión estratégica',
      'Diseñar proceso de onboarding que maximice engagement',
      'Desarrollar estrategia de partnerships estratégicos mutuamente beneficiosos',
      'Crear framework de evaluación de riesgos integral'
    ],
    audience: [
      'C-Level executives y board de directores',
      'Inversionistas institucionales y venture capital',
      'Middle management y líderes de equipos',
      'Equipos técnicos especializados (developers, data scientists)',
      'Clientes B2B enterprise con procesos de compra complejos',
      'Consumidores millennials y Gen Z digitalmente nativos',
      'Profesionales especializados en búsqueda de soluciones específicas',
      'Reguladores gubernamentales y entidades de compliance',
      'Medios de comunicación y periodistas especializados',
      'Comunidad académica e investigadores del sector',
      'Partners estratégicos y proveedores clave',
      'Empleados actuales en proceso de cambio organizacional',
      'Candidatos de alto potencial para reclutamiento',
      'Influencers y thought leaders de la industria',
      'Clientes existentes en riesgo de churn',
      'Early adopters y usuarios beta de productos innovadores',
      'Distribuidores y canal de ventas indirecto',
      'Comunidades online y usuarios de redes sociales',
      'Analistas financieros y de industria',
      'Consultores externos y asesores especializados'
    ],
    format: [
      'Ejecutivo y directo con bullets de acción inmediata',
      'Narrativo con storytelling emocional y casos de éxito',
      'Técnico con datos, métricas y evidencia cuantificable',
      'Conversacional y cercano con tono humano auténtico',
      'Académico con referencias, fuentes y marco teórico sólido',
      'Inspiracional con visión de futuro y llamada a la acción',
      'Estructurado con framework claro y pasos secuenciales',
      'Creativo con metáforas, analogías y elementos visuales',
      'Persuasivo con argumentos lógicos y emocionales balanceados',
      'Consultivo posicionando como experto que asesora',
      'Urgente transmitiendo necesidad de acción inmediata',
      'Colaborativo invitando a co-creación y participación',
      'Transparente con honestidad sobre desafíos y limitaciones',
      'Visionario pintando escenario futuro deseable',
      'Analítico con deep dive en causas raíz y soluciones',
      'Empático reconociendo emociones y preocupaciones del audience',
      'Innovador desafiando status quo con propuestas disruptivas',
      'Pragmático enfocado en implementación y resultados concretos',
      'Aspiracional conectando con valores y propósito superior',
      'Educativo construyendo conocimiento paso a paso'
    ],
    examples: [
      'Case study completo de transformación exitosa similar',
      'Benchmarks de industria con mejores prácticas comprobadas',
      'Testimonios específicos de clientes con resultados medibles',
      'Analogías del mundo real que simplifican conceptos complejos',
      'Escenarios hipotéticos con diferentes variables y outcomes',
      'Frameworks probados de consultoras top tier (McKinsey, BCG)',
      'Datos de investigación académica reciente y relevante',
      'Comparaciones antes/después con métricas específicas',
      'Ejemplos de competidores que han ejecutado estrategias similares',
      'Modelos mentales y heurísticas de decisión efectivas'
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
      'No usar superlativOS exagerados que comprometan credibilidad'
    ]
  };
  
  const updatePromptData = (key: keyof PromptData, value: string) => {
    setPromptData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    } else {
      generatePrompt();
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const canProceed = () => {
    // Todos los pasos son opcionales
    return true;
  };

  const generatePrompt = () => {
    let prompt = '';
    let sections = [];
    
    // Advanced prompt structure with multiple components
    if (promptData.role) {
      const roleSection = `# ROL Y EXPERTISE\nActúa como ${promptData.role}. Aprovecha tu experiencia especializada, conocimiento profundo del sector y metodologías probadas para proporcionar insights valiosos y accionables.`;
      sections.push(roleSection);
    }
    
    if (promptData.context) {
      const contextSection = `# CONTEXTO Y SITUACIÓN\n${promptData.context}\n\nConsidera las implicaciones estratégicas, los factores del entorno competitivo, las tendencias actuales del mercado y los desafíos específicos que enfrenta la organización en este contexto.`;
      sections.push(contextSection);
    }
    
    if (promptData.task) {
      const taskSection = `# OBJETIVO Y TAREA PRINCIPAL\n${promptData.task}\n\nDesglosa la tarea en componentes específicos, identifica los entregables clave, establece criterios de éxito medibles y considera las dependencias e interrelaciones con otros procesos organizacionales.`;
      sections.push(taskSection);
    }
    
    if (promptData.audience) {
      const audienceSection = `# AUDIENCIA OBJETIVO\nDirige tu respuesta específicamente a: ${promptData.audience}\n\nAdapta el nivel de detalle técnico, el lenguaje utilizado, los ejemplos relevantes y las referencias culturales para maximizar la resonancia y comprensión de esta audiencia específica. Considera sus motivaciones principales, preocupaciones típicas y procesos de toma de decisión.`;
      sections.push(audienceSection);
    }
    
    if (promptData.format) {
      const formatSection = `# ESTILO Y FORMATO REQUERIDO\nUtiliza un enfoque ${promptData.format}\n\nMantén consistencia en el tono a lo largo de toda la respuesta, estructura la información de manera lógica y progresiva, utiliza transiciones fluidas entre conceptos, y asegúrate de que cada párrafo agregue valor único al mensaje general.`;
      sections.push(formatSection);
    }
    
    if (promptData.examples) {
      const examplesSection = `# EJEMPLOS Y REFERENCIAS\nIncorpora estos ejemplos como referencia: ${promptData.examples}\n\nUtiliza estos ejemplos para ilustrar puntos clave, establecer benchmarks de calidad, demostrar aplicación práctica de conceptos teóricos y proporcionar evidencia concreta que respalde tus recomendaciones.`;
      sections.push(examplesSection);
    }
    
    if (promptData.restrictions) {
      const restrictionsSection = `# RESTRICCIONES Y CONSIDERACIONES\n${promptData.restrictions}\n\nAdhiérete estrictamente a estas limitaciones mientras maximizas el valor y la utilidad de la respuesta dentro de los parámetros establecidos.`;
      sections.push(restrictionsSection);
    }

    // Additional enhancement sections for more complex prompts
    const enhancementSections = [];
    
    if (sections.length > 0) {
      enhancementSections.push(`# METODOLOGÍA Y ENFOQUE\nEstructura tu respuesta utilizando un framework sistemático que incluya:\n- Análisis de la situación actual\n- Identificación de oportunidades y desafíos\n- Desarrollo de soluciones o recomendaciones específicas\n- Plan de implementación con pasos concretos\n- Métricas de éxito y seguimiento`);
      
      enhancementSections.push(`# CRITERIOS DE CALIDAD\nAsegúrate de que tu respuesta:\n- Proporcione valor inmediato y accionable\n- Esté respaldada por evidencia o mejores prácticas\n- Considere múltiples perspectivas y escenarios\n- Incluya consideraciones de riesgo y mitigación\n- Mantenga un balance entre profundidad y claridad`);
      
      enhancementSections.push(`# ESTRUCTURA DE ENTREGA\nOrganiza tu respuesta con:\n1. Resumen ejecutivo con puntos clave\n2. Desarrollo detallado con argumentación sólida\n3. Recomendaciones específicas y priorizadas\n4. Próximos pasos concretos y timeline\n5. Conclusión que refuerce el valor propuesto`);
    }
    
    // Combine all sections
    const allSections = [...sections, ...enhancementSections];
    prompt = allSections.join('\n\n');
    
    // Add final instructions for completeness
    if (prompt) {
      prompt += `\n\n# INSTRUCCIONES FINALES\nProporciona una respuesta completa, bien estructurada y de alta calidad que demuestre expertise profesional y agregue valor significativo para la audiencia objetivo. Utiliza ejemplos específicos cuando sea apropiado y asegúrate de que cada sección contribuya al objetivo general establecido.`;
    }

    setGeneratedPrompt(prompt.trim());
  };

  const formatPromptOutput = () => {
    if (!generatedPrompt) return '';
    
    switch (outputFormat) {
      case 'html':
        return generatedPrompt
          .split('\n\n')
          .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
          .join('\n');
      
      case 'json':
        const sections = generatedPrompt.split('\n\n');
        const jsonOutput = {
          prompt: generatedPrompt,
          sections: sections.map((section, index) => ({
            id: index + 1,
            content: section
          })),
          metadata: {
            created: new Date().toISOString(),
            mode: mode,
            steps_completed: Object.values(promptData).filter(v => v.trim().length > 0).length
          }
        };
        return JSON.stringify(jsonOutput, null, 2);
      
      default:
        return generatedPrompt;
    }
  };

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
    setCurrentStep('role');
    setOutputFormat('text');
    setGeneratedPrompt('');
    setPromptData({
      role: '',
      context: '',
      task: '',
      audience: '',
      format: '',
      examples: '',
      restrictions: ''
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
              Prompt Builder Inteligente
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
              Crea prompts profesionales paso a paso siguiendo los 7 pilares del prompt engineering.
              Integra automáticamente el tono, estilo y voz de tu marca para resultados consistentes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group animate-slide-up" 
                  onClick={() => setMode('simple')}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="text-center pb-6 relative">
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-3 font-bold">Prompt Sencillo</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Flujo rápido y eficiente con opciones clave preestablecidas. Perfecto para crear prompts profesionales en minutos.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center"><Heart className="h-4 w-4 mr-3 text-primary" />7 pilares esenciales</li>
                  <li className="flex items-center"><Star className="h-4 w-4 mr-3 text-primary" />Opciones preestablecidas</li>
                  <li className="flex items-center"><Lightbulb className="h-4 w-4 mr-3 text-primary" />Proceso optimizado</li>
                  <li className="flex items-center"><Target className="h-4 w-4 mr-3 text-primary" />Resultados consistentes</li>
                </ul>
                <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group-hover:shadow-lg transition-all duration-300">
                  <Play className="h-5 w-5 mr-2" />
                  Comenzar Prompt Sencillo
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group animate-slide-up delay-200" 
                  onClick={() => setMode('advanced')}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="text-center pb-6 relative">
                <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-3 font-bold">Prompt Avanzado</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Control total y máxima personalización. Para usuarios experimentados que buscan resultados específicos.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center"><Settings2 className="h-4 w-4 mr-3 text-primary" />7 pilares completos</li>
                  <li className="flex items-center"><Palette className="h-4 w-4 mr-3 text-primary" />Personalización total</li>
                  <li className="flex items-center"><Shield className="h-4 w-4 mr-3 text-primary" />Control de restricciones</li>
                  <li className="flex items-center"><BookOpen className="h-4 w-4 mr-3 text-primary" />Ejemplos detallados</li>
                </ul>
                <Button size="lg" variant="outline" className="w-full border-2 hover:bg-primary hover:text-primary-foreground group-hover:shadow-lg transition-all duration-300">
                  <Settings2 className="h-5 w-5 mr-2" />
                  Comenzar Prompt Avanzado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Step-by-step wizard
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const currentStepData = steps[currentStepIndex];
  const Icon = currentStepData.icon;

  return (
    <section id="builder" className="py-20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header with bubble progress */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {mode === 'simple' ? 'Prompt Sencillo' : 'Prompt Avanzado'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {mode === 'simple' 
                  ? 'Flujo optimizado con opciones preestablecidas'
                  : 'Máxima personalización y control detallado'
                }
              </p>
            </div>
            <Button variant="outline" onClick={resetBuilder} className="border-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
          
          {/* Bubble Progress */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                      : isCurrent
                        ? 'bg-primary/20 border-primary text-primary scale-110 shadow-md'
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 transition-colors ${
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Paso {currentStepIndex + 1} de {steps.length}: {currentStepData.title}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center space-x-4 text-2xl">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span>{currentStepData.title}</span>
                <Badge variant="secondary" className="ml-auto">
                  {currentStepData.required ? 'Obligatorio' : 'Opcional'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-3">
                {getStepDescription(currentStep)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {mode === 'simple' && brandOptions[currentStep as keyof typeof brandOptions] ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Opciones preestablecidas:
                  </label>
                  <Select 
                    value={promptData[currentStep]} 
                    onValueChange={(value) => updatePromptData(currentStep, value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={`Selecciona ${currentStepData.title.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {brandOptions[currentStep as keyof typeof brandOptions]?.map((option) => (
                        <SelectItem key={option} value={option} className="py-3">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  {mode === 'simple' && brandOptions[currentStep as keyof typeof brandOptions] 
                    ? 'O describe tu propio contenido:' 
                    : `Describe tu ${currentStepData.title.toLowerCase()}:`}
                </label>
                <Textarea
                  placeholder={getStepPlaceholder(currentStep)}
                  value={promptData[currentStep]}
                  onChange={(e) => updatePromptData(currentStep, e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  size="lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  size="lg"
                >
                  {currentStepIndex === steps.length - 1 ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generar Prompt
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated prompt display */}
          {generatedPrompt && (
            <Card className="mt-8 shadow-lg border-2 animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Tu Prompt Personalizado</CardTitle>
                  <div className="flex items-center space-x-3">
                    {/* Format toggle buttons */}
                    <div className="flex bg-muted rounded-lg p-1">
                      <Button
                        variant={outputFormat === 'text' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('text')}
                        className="rounded-md text-xs px-3"
                      >
                        Texto
                      </Button>
                      <Button
                        variant={outputFormat === 'html' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('html')}
                        className="rounded-md text-xs px-3"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        HTML
                      </Button>
                      <Button
                        variant={outputFormat === 'json' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('json')}
                        className="rounded-md text-xs px-3"
                      >
                        <FileCode className="h-3 w-3 mr-1" />
                        JSON
                      </Button>
                    </div>
                    
                    <Button variant="outline" onClick={copyPrompt} size="lg">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-6 border-2 border-primary/20">
                  <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed overflow-x-auto">
                    {formatPromptOutput()}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

// Helper functions
function getStepDescription(step: Step): string {
  const descriptions = {
    role: 'Define qué experto, profesional o personalidad específica debe adoptar la IA. Esto incluye su nivel de expertise, años de experiencia, especialización y metodologías que domina.',
    context: 'Proporciona información detallada de fondo, situación actual del mercado, desafíos específicos del sector, antecedentes históricos relevantes y factores del entorno que influyen en la situación.',
    task: 'Especifica con precisión qué acción principal, deliverable o resultado debe generar la IA. Define el alcance, profundidad esperada y componentes específicos que debe incluir la respuesta.',
    audience: 'Define detalladamente para quién será la respuesta, incluyendo su nivel de conocimiento técnico, motivaciones principales, procesos de decisión, preocupaciones típicas y contexto organizacional.',
    format: 'Indica el tono específico, estilo narrativo, estructura preferida, nivel de formalidad, uso de ejemplos, densidad informativa y cómo quieres que se organice y presente la información.',
    examples: 'Proporciona referencias específicas, casos de estudio, benchmarks de industria, testimonios, frameworks comprobados o cualquier ejemplo concreto que sirva como guía para la calidad y estilo esperado.',
    restrictions: 'Establece límites claros, consideraciones legales, restricciones de confidencialidad, límites de extensión, temas a evitar y cualquier parámetro que la IA debe respetar estrictamente.'
  };
  return descriptions[step];
}

function getStepPlaceholder(step: Step): string {
  const placeholders = {
    role: 'Ej: Consultor senior de McKinsey especializado en transformación digital con 15 años de experiencia ayudando a Fortune 500 en la implementación de estrategias tecnológicas disruptivas, con expertise particular en change management y adopción de IA empresarial.',
    context: 'Ej: Mi empresa es una compañía manufacturera tradicional de 150 años que enfrenta disrupción digital acelerada por competidores tech-enabled. Hemos perdido 15% market share en 24 meses y nuestros procesos actuales son 40% menos eficientes que benchmarks digitales...',
    task: 'Ej: Desarrollar una hoja de ruta integral de transformación digital de 36 meses que incluya: diagnóstico actual detallado, identificación de quick wins, roadmap de tecnologías prioritarias, plan de change management, estructura de governance, métricas de seguimiento y business case financiero robusto.',
    audience: 'Ej: Board de directores compuesto por ejecutivos de 55+ años con background tradicional, alta aversión al riesgo, enfoque ROI-driven, preocupados por job displacement y necesidad de aprobar inversión de $50M+ con justificación sólida ante shareholders conservadores.',
    format: 'Ej: Presentación ejecutiva estilo consultoría premium con: resumen ejecutivo de 2 minutos, análisis estructurado con framework MECE, datos cuantitativos que respalden cada argumento, roadmap visual claro, business case con NPV/IRR, y call-to-action específico con next steps inmediatos.',
    examples: 'Ej: Caso de transformación exitosa de General Electric bajo Jeffrey Immelt, framework de transformación digital de BCG, metodología de adoption de Salesforce, benchmarks de McKinsey Global Institute sobre ROI de IA empresarial, y testimonios específicos de CEOs que lideraron transformaciones similares.',
    restrictions: 'Ej: Máximo 15 slides + anexos, evitar mencionar competidores directos por NDA, mantener tono conservador apropiado para cultura corporativa tradicional, incluir únicamente tecnologías maduras con track record comprobado, no exceder budget preliminar de $50M, considerar constraints regulatorios del sector.'
  };
  return placeholders[step];
}

export default PromptBuilder;
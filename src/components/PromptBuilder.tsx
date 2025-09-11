import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2, RefreshCw, Settings, ChevronLeft, ChevronRight, Play, User, FileText, Target, Users, Layout, BookOpen, Shield, Code, FileCode, Settings2, Heart, Zap, Star, Lightbulb, MessageCircle, Volume2, Palette, Gauge } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = 'initial' | 'normal' | 'advanced';
type NormalStep = 'context' | 'tone' | 'style' | 'audience';
type AdvancedStep = 'objective' | 'context' | 'audience' | 'tone' | 'style' | 'detail' | 'restrictions' | 'keywords' | 'examples';
type OutputFormat = 'text' | 'html' | 'json';

interface PromptData {
  // Modo Normal
  context: string;
  tone: string;
  style: string;
  audience: string;
  // Modo Avanzado adicional
  objective: string;
  detailLevel: string;
  restrictions: string;
  keywords: string;
  examples: string;
}

const PromptBuilder = () => {
  const { toast } = useToast();
  
  // Main state
  const [mode, setMode] = useState<Mode>('initial');
  const [currentStep, setCurrentStep] = useState<NormalStep | AdvancedStep>('context');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('text');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  
  // Prompt data
  const [promptData, setPromptData] = useState<PromptData>({
    context: '',
    tone: '',
    style: '',
    audience: '',
    objective: '',
    detailLevel: '',
    restrictions: '',
    keywords: '',
    examples: ''
  });

  // Steps configuration for Normal mode
  const normalSteps: { key: NormalStep; title: string; icon: any; required: boolean }[] = [
    { key: 'context', title: 'Contexto', icon: MessageCircle, required: false },
    { key: 'tone', title: 'Tono', icon: Volume2, required: false },
    { key: 'style', title: 'Estilo', icon: Palette, required: false },
    { key: 'audience', title: 'Audiencia', icon: Users, required: false }
  ];

  // Steps configuration for Advanced mode  
  const advancedSteps: { key: AdvancedStep; title: string; icon: any; required: boolean }[] = [
    { key: 'objective', title: 'Objetivo', icon: Target, required: false },
    { key: 'context', title: 'Contexto', icon: MessageCircle, required: false },
    { key: 'audience', title: 'Audiencia', icon: Users, required: false },
    { key: 'tone', title: 'Tono', icon: Volume2, required: false },
    { key: 'style', title: 'Estilo', icon: Palette, required: false },
    { key: 'detail', title: 'Nivel de Detalle', icon: Gauge, required: false },
    { key: 'restrictions', title: 'Restricciones', icon: Shield, required: false },
    { key: 'keywords', title: 'Palabras Clave', icon: Star, required: false },
    { key: 'examples', title: 'Ejemplos', icon: BookOpen, required: false }
  ];

  // Options for brand voice and style
  const brandOptions = {
    context: [
      'Informar sobre un producto o servicio',
      'Educar sobre un tema específico',
      'Convencer o persuadir',
      'Entretener y engagement',
      'Resolver un problema',
      'Anunciar cambios o novedades'
    ],
    objective: [
      'Informar de manera clara y precisa',
      'Educar y formar conocimiento',
      'Persuadir e influir decisiones',
      'Inspirar y motivar acción',
      'Analizar y evaluar datos',
      'Crear contenido engaging',
      'Resolver problemas específicos',
      'Generar ideas innovadoras'
    ],
    tone: [
      'Profesional y confiable',
      'Cercano y empático',
      'Innovador y vanguardista', 
      'Humano y auténtico',
      'Inspirador y motivacional',
      'Técnico y especializado',
      'Creativo y original',
      'Directo y claro'
    ],
    style: [
      'Directo al grano',
      'Narrativo con storytelling',
      'Explicativo con ejemplos',
      'Emocional y persuasivo',
      'Técnico y detallado',
      'Conversacional y amigable',
      'Formal y estructurado',
      'Creativo y original',
      'Minimalista y esencial'
    ],
    audience: [
      'Clientes potenciales',
      'Colaboradores internos',
      'Público general',
      'Profesionales del sector',
      'Inversores y stakeholders',
      'Usuarios técnicos',
      'Estudiantes y aprendices',
      'Medios y prensa'
    ],
    detailLevel: [
      'Muy resumido (puntos clave)',
      'Intermedio (explicación clara)',
      'Profundo (análisis detallado)'
    ]
  };

  const getCurrentSteps = () => mode === 'normal' ? normalSteps : advancedSteps;
  
  const updatePromptData = (key: keyof PromptData, value: string) => {
    setPromptData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    const currentSteps = getCurrentSteps();
    const currentIndex = currentSteps.findIndex(step => step.key === currentStep);
    if (currentIndex < currentSteps.length - 1) {
      setCurrentStep(currentSteps[currentIndex + 1].key);
    } else {
      generatePrompt();
    }
  };

  const prevStep = () => {
    const currentSteps = getCurrentSteps();
    const currentIndex = currentSteps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(currentSteps[currentIndex - 1].key);
    }
  };

  const canProceed = () => {
    // En este builder, ningún paso es obligatorio
    return true;
  };

  const generatePrompt = () => {
    let prompt = '';
    
    if (mode === 'advanced' && promptData.objective) {
      prompt += `Objetivo: ${promptData.objective}\n\n`;
    }
    
    if (promptData.context) {
      prompt += `Contexto: ${promptData.context}\n\n`;
    }
    
    if (promptData.audience) {
      prompt += `Audiencia objetivo: ${promptData.audience}\n\n`;
    }
    
    if (promptData.tone) {
      prompt += `Tono de voz: ${promptData.tone}\n\n`;
    }
    
    if (promptData.style) {
      prompt += `Estilo narrativo: ${promptData.style}\n\n`;
    }
    
    if (mode === 'advanced' && promptData.detailLevel) {
      prompt += `Nivel de detalle: ${promptData.detailLevel}\n\n`;
    }
    
    if (mode === 'advanced' && promptData.restrictions) {
      prompt += `Restricciones: ${promptData.restrictions}\n\n`;
    }
    
    if (mode === 'advanced' && promptData.keywords) {
      prompt += `Palabras clave: ${promptData.keywords}\n\n`;
    }
    
    if (mode === 'advanced' && promptData.examples) {
      prompt += `Ejemplos de referencia: ${promptData.examples}\n\n`;
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
    setCurrentStep('context');
    setOutputFormat('text');
    setGeneratedPrompt('');
    setPromptData({
      context: '',
      tone: '',
      style: '',
      audience: '',
      objective: '',
      detailLevel: '',
      restrictions: '',
      keywords: '',
      examples: ''
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
              Crea prompts profesionales paso a paso siguiendo las mejores prácticas de prompt engineering.
              Integra automáticamente el tono, estilo y voz de tu marca para resultados consistentes.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-500 cursor-pointer group animate-slide-up" 
                  onClick={() => setMode('normal')}>
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
                  <li className="flex items-center"><Heart className="h-4 w-4 mr-3 text-primary" />4 pasos esenciales</li>
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
                  <li className="flex items-center"><Settings2 className="h-4 w-4 mr-3 text-primary" />9 secciones detalladas</li>
                  <li className="flex items-center"><Palette className="h-4 w-4 mr-3 text-primary" />Personalización completa</li>
                  <li className="flex items-center"><Shield className="h-4 w-4 mr-3 text-primary" />Control de restricciones</li>
                  <li className="flex items-center"><BookOpen className="h-4 w-4 mr-3 text-primary" />Ejemplos y referencias</li>
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
  const currentSteps = getCurrentSteps();
  const currentStepIndex = currentSteps.findIndex(step => step.key === currentStep);
  const currentStepData = currentSteps[currentStepIndex];
  const Icon = currentStepData.icon;

  return (
    <section id="builder" className="py-20 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header with progress */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {mode === 'normal' ? 'Prompt Sencillo' : 'Prompt Avanzado'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {mode === 'normal' 
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
          
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">
                Paso {currentStepIndex + 1} de {currentSteps.length}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(((currentStepIndex + 1) / currentSteps.length) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / currentSteps.length) * 100}%` }}
              />
            </div>
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
                {getStepDescription(currentStep, mode)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {brandOptions[currentStep as keyof typeof brandOptions] ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Opciones preestablecidas:
                  </label>
                  <Select 
                    value={promptData[getPromptKey(currentStep)]} 
                    onValueChange={(value) => updatePromptData(getPromptKey(currentStep), value)}
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
                  {brandOptions[currentStep as keyof typeof brandOptions] ? 'O describe tu propio contenido:' : `Describe tu ${currentStepData.title.toLowerCase()}:`}
                </label>
                <Textarea
                  placeholder={getStepPlaceholder(currentStep)}
                  value={promptData[getPromptKey(currentStep)]}
                  onChange={(e) => updatePromptData(getPromptKey(currentStep), e.target.value)}
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
                  {currentStepIndex === currentSteps.length - 1 ? (
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
function getStepDescription(step: NormalStep | AdvancedStep, mode: Mode): string {
  const descriptions = {
    context: 'Define el propósito y situación específica para tu prompt',
    tone: 'Establece el tono de voz que debe usar la IA en su respuesta',
    style: 'Determina el estilo narrativo y forma de comunicación',
    audience: 'Especifica para quién será dirigida la respuesta',
    objective: 'Define el objetivo principal que debe lograr la IA',
    detail: 'Establece qué tan detallada debe ser la respuesta',
    restrictions: 'Define límites y reglas que la IA debe seguir',
    keywords: 'Palabras clave importantes que deben incluirse',
    examples: 'Ejemplos del tipo de respuesta que esperas obtener'
  };
  return descriptions[step] || '';
}

function getStepPlaceholder(step: NormalStep | AdvancedStep): string {
  const placeholders = {
    context: 'Ej: Mi empresa necesita crear contenido para redes sociales sobre productos eco-friendly...',
    tone: 'Ej: Profesional pero cercano, que genere confianza y sea accesible...',
    style: 'Ej: Narrativo con ejemplos prácticos, evitando tecnicismos...',
    audience: 'Ej: Jóvenes profesionales de 25-35 años interesados en sostenibilidad...',
    objective: 'Ej: Generar 5 ideas de contenido que aumenten el engagement...',
    detail: 'Selecciona el nivel de profundidad deseado',
    restrictions: 'Ej: No exceder 280 caracteres, evitar palabras técnicas...',
    keywords: 'Ej: sostenible, eco-friendly, innovación, futuro verde...',
    examples: 'Ej: "Descubre cómo pequeños cambios generan gran impacto..."'
  };
  return placeholders[step] || '';
}

function getPromptKey(step: NormalStep | AdvancedStep): keyof PromptData {
  const keyMap: Record<string, keyof PromptData> = {
    context: 'context',
    tone: 'tone', 
    style: 'style',
    audience: 'audience',
    objective: 'objective',
    detail: 'detailLevel',
    restrictions: 'restrictions',
    keywords: 'keywords',
    examples: 'examples'
  };
  return keyMap[step];
}

export default PromptBuilder;
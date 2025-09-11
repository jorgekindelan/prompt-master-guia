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

  // Options for brand voice and style
  const brandOptions = {
    role: [
      'Experto en marketing digital',
      'Consultor de negocios',
      'Profesor universitario',
      'Escritor profesional',
      'Analista de datos',
      'Especialista en comunicación'
    ],
    context: [
      'Informar sobre un producto o servicio',
      'Educar sobre un tema específico',
      'Convencer o persuadir',
      'Entretener y generar engagement',
      'Resolver un problema',
      'Anunciar cambios o novedades'
    ],
    task: [
      'Crear contenido informativo',
      'Analizar datos o información', 
      'Generar ideas creativas',
      'Explicar conceptos complejos',
      'Resolver un problema específico',
      'Escribir texto persuasivo'
    ],
    audience: [
      'Clientes potenciales',
      'Colaboradores internos',
      'Público general',
      'Profesionales del sector',
      'Inversores y stakeholders',
      'Usuarios técnicos',
      'Estudiantes y aprendices'
    ],
    format: [
      'Directo al grano',
      'Narrativo con storytelling',
      'Explicativo con ejemplos',
      'Emocional y persuasivo',
      'Técnico y detallado',
      'Conversacional y amigable',
      'Formal y estructurado',
      'Creativo y original'
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
    
    if (promptData.role) {
      prompt += `Actúa como ${promptData.role}.\n\n`;
    }
    
    if (promptData.context) {
      prompt += `Contexto: ${promptData.context}\n\n`;
    }
    
    if (promptData.task) {
      prompt += `Tarea: ${promptData.task}\n\n`;
    }
    
    if (promptData.audience) {
      prompt += `Audiencia objetivo: ${promptData.audience}\n\n`;
    }
    
    if (promptData.format) {
      prompt += `Estilo y formato: ${promptData.format}\n\n`;
    }
    
    if (promptData.examples) {
      prompt += `Ejemplos de referencia: ${promptData.examples}\n\n`;
    }
    
    if (promptData.restrictions) {
      prompt += `Restricciones: ${promptData.restrictions}\n\n`;
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
    role: 'Define qué experto o personalidad debe adoptar la IA para responder',
    context: 'Proporciona información de fondo y situación específica',
    task: 'Especifica qué acción principal debe realizar la IA',
    audience: 'Define para quién será la respuesta (opcional pero recomendado)',
    format: 'Indica el tono, estilo y cómo quieres estructurar la respuesta',
    examples: 'Proporciona ejemplos del tipo de respuesta que esperas',
    restrictions: 'Establece límites y reglas que la IA debe seguir'
  };
  return descriptions[step];
}

function getStepPlaceholder(step: Step): string {
  const placeholders = {
    role: 'Ej: Experto en marketing digital con 10 años de experiencia en e-commerce',
    context: 'Ej: Mi empresa es una startup de tecnología que vende productos eco-friendly...',
    task: 'Ej: Analiza la estrategia de contenidos y sugiere 5 mejoras específicas',
    audience: 'Ej: Empresarios jóvenes de 25-40 años interesados en sostenibilidad',
    format: 'Ej: Tono profesional pero cercano, lista numerada con explicación de 2-3 líneas por punto',
    examples: 'Ej: Como este estilo: "1. Optimización SEO - Mejora la visibilidad..."',
    restrictions: 'Ej: No exceder 300 palabras, usar tono profesional pero cercano'
  };
  return placeholders[step];
}

export default PromptBuilder;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2, RefreshCw, Settings, ChevronLeft, ChevronRight, Play, User, FileText, Target, Users, Layout, BookOpen, Shield, Code, FileCode, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Mode = 'initial' | 'simplified' | 'advanced';
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

  // Steps configuration
  const steps: { key: Step; title: string; icon: any; required: boolean }[] = [
    { key: 'role', title: 'Rol', icon: User, required: true },
    { key: 'context', title: 'Contexto', icon: FileText, required: true },
    { key: 'task', title: 'Tarea', icon: Target, required: true },
    { key: 'audience', title: 'Audiencia', icon: Users, required: false },
    { key: 'format', title: 'Formato', icon: Layout, required: false },
    { key: 'examples', title: 'Ejemplos', icon: BookOpen, required: false },
    { key: 'restrictions', title: 'Restricciones', icon: Shield, required: false }
  ];

  // Options for simplified mode
  const simplifiedOptions = {
    role: [
      'Experto en marketing digital',
      'Escritor profesional',
      'Consultor de negocios',
      'Profesor universitario',
      'Analista de datos'
    ],
    context: [
      'Para una empresa startup tecnológica',
      'Para un blog personal',
      'Para una presentación corporativa',
      'Para contenido educativo',
      'Para redes sociales'
    ],
    task: [
      'Crear contenido informativo',
      'Analizar datos o información',
      'Generar ideas creativas',
      'Explicar conceptos complejos',
      'Resolver un problema específico'
    ],
    audience: [
      'Profesionales del sector',
      'Público general',
      'Estudiantes',
      'Clientes potenciales',
      'Equipo interno'
    ],
    format: [
      'Lista numerada',
      'Párrafos estructurados',
      'Puntos clave',
      'Guía paso a paso',
      'Informe detallado'
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
    const currentStepData = steps.find(step => step.key === currentStep);
    if (!currentStepData?.required) return true;
    return promptData[currentStep].trim().length > 0;
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
      prompt += `Formato de respuesta: ${promptData.format}\n\n`;
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
      <section id="builder" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Prompt Builder <span className="text-primary">Interactivo</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Crea prompts personalizados paso a paso siguiendo los 7 pilares del prompt engineering.
              Elige tu modo preferido para comenzar.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-card-custom hover:shadow-lg transition-all duration-300 cursor-pointer group animate-slide-up" 
                  onClick={() => setMode('simplified')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings2 className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Modo Simplificado</CardTitle>
                <CardDescription>
                  Flujo guiado con opciones preestablecidas. Perfecto para comenzar rápidamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Opciones predefinidas</li>
                  <li>✓ Proceso más rápido</li>
                  <li>✓ Ideal para principiantes</li>
                  <li>✓ Navegación simple</li>
                </ul>
                <Button className="w-full mt-6 group-hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Empezar Modo Simplificado
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card-custom hover:shadow-lg transition-all duration-300 cursor-pointer group animate-slide-up delay-200" 
                  onClick={() => setMode('advanced')}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Settings className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Modo Avanzado</CardTitle>
                <CardDescription>
                  Mayor personalización y flexibilidad. Control total sobre cada elemento del prompt.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Personalización completa</li>
                  <li>✓ Máxima flexibilidad</li>
                  <li>✓ Para usuarios experimentados</li>
                  <li>✓ Control detallado</li>
                </ul>
                <Button className="w-full mt-6 group-hover:bg-primary/90">
                  <Play className="h-4 w-4 mr-2" />
                  Empezar Modo Avanzado
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
    <section id="builder" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">
              Creando tu Prompt - {mode === 'simplified' ? 'Modo Simplificado' : 'Modo Avanzado'}
            </h2>
            <Button variant="outline" size="sm" onClick={resetBuilder}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  index <= currentStepIndex 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Icon className="h-6 w-6 text-primary" />
                <span>Paso {currentStepIndex + 1}: {currentStepData.title}</span>
                {currentStepData.required && (
                  <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {getStepDescription(currentStep)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {mode === 'simplified' && simplifiedOptions[currentStep as keyof typeof simplifiedOptions] ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Selecciona una opción:
                  </label>
                  <Select 
                    value={promptData[currentStep]} 
                    onValueChange={(value) => updatePromptData(currentStep, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Elige ${currentStepData.title.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {simplifiedOptions[currentStep as keyof typeof simplifiedOptions]?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    Describe tu {currentStepData.title.toLowerCase()}:
                  </label>
                  <Textarea
                    placeholder={getStepPlaceholder(currentStep)}
                    value={promptData[currentStep]}
                    onChange={(e) => updatePromptData(currentStep, e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                
                <Button 
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-primary hover:bg-primary/90"
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
            <Card className="mt-8 shadow-card-custom animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tu Prompt Generado</CardTitle>
                  <div className="flex items-center space-x-2">
                    {/* Format toggle buttons */}
                    <div className="flex bg-muted rounded-lg p-1">
                      <Button
                        variant={outputFormat === 'text' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('text')}
                        className="rounded-md text-xs"
                      >
                        Texto
                      </Button>
                      <Button
                        variant={outputFormat === 'html' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('html')}
                        className="rounded-md text-xs"
                      >
                        <Code className="h-3 w-3 mr-1" />
                        HTML
                      </Button>
                      <Button
                        variant={outputFormat === 'json' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setOutputFormat('json')}
                        className="rounded-md text-xs"
                      >
                        <FileCode className="h-3 w-3 mr-1" />
                        JSON
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={copyPrompt}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 border-2 border-primary/20">
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
    format: 'Indica cómo quieres estructurar la respuesta',
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
    format: 'Ej: Lista numerada con explicación de 2-3 líneas por punto',
    examples: 'Ej: Como este estilo: "1. Optimización SEO - Mejora la visibilidad..."',
    restrictions: 'Ej: No exceder 300 palabras, usar tono profesional pero cercano'
  };
  return placeholders[step];
}

export default PromptBuilder;
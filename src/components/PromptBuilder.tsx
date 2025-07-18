import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2, RefreshCw, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PromptBuilder = () => {
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [selectedDetail, setSelectedDetail] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [customContext, setCustomContext] = useState<string>("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");

  const goals = [
    { value: "escribir", label: "Escribir contenido", template: "Redacta un [tipo de contenido] sobre [tema]" },
    { value: "analizar", label: "Analizar información", template: "Analiza [datos/información] y proporciona" },
    { value: "traducir", label: "Traducir texto", template: "Traduce el siguiente texto de [idioma origen] a [idioma destino]" },
    { value: "resumir", label: "Resumir contenido", template: "Resume el siguiente contenido en [formato]" },
    { value: "codigo", label: "Generar código", template: "Crea una función en [lenguaje] que [funcionalidad]" },
    { value: "planificar", label: "Crear plan", template: "Desarrolla un plan detallado para [objetivo]" },
    { value: "creatividad", label: "Brainstorming creativo", template: "Genera ideas creativas para [proyecto/problema]" },
    { value: "educacion", label: "Explicar conceptos", template: "Explica [concepto] de manera [nivel de dificultad]" }
  ];

  const detailLevels = [
    { value: "basico", label: "Básico", description: "Respuesta simple y directa" },
    { value: "intermedio", label: "Intermedio", description: "Respuesta detallada con ejemplos" },
    { value: "avanzado", label: "Avanzado", description: "Análisis profundo y completo" },
    { value: "experto", label: "Nivel experto", description: "Perspectiva técnica y especializada" }
  ];

  const styles = [
    { value: "profesional", label: "Profesional", description: "Formal y objetivo" },
    { value: "conversacional", label: "Conversacional", description: "Cercano y amigable" },
    { value: "academico", label: "Académico", description: "Riguroso y documentado" },
    { value: "creativo", label: "Creativo", description: "Original y expresivo" },
    { value: "persuasivo", label: "Persuasivo", description: "Convincente y motivador" },
    { value: "tecnico", label: "Técnico", description: "Preciso y especializado" }
  ];

  const formats = [
    { value: "lista", label: "Lista numerada", example: "1. Punto uno\n2. Punto dos..." },
    { value: "parrafos", label: "Párrafos", example: "Texto estructurado en párrafos..." },
    { value: "tabla", label: "Tabla", example: "| Columna 1 | Columna 2 |..." },
    { value: "puntos", label: "Viñetas", example: "• Punto importante\n• Otro punto..." },
    { value: "pasos", label: "Paso a paso", example: "Paso 1: Acción inicial..." },
    { value: "codigo", label: "Bloque de código", example: "```javascript\n// código aquí\n```" }
  ];

  const generatePrompt = () => {
    if (!selectedGoal || !selectedDetail || !selectedStyle || !selectedFormat) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos para generar el prompt.",
        variant: "destructive"
      });
      return;
    }

    const goalTemplate = goals.find(g => g.value === selectedGoal)?.template || "";
    const detailLabel = detailLevels.find(d => d.value === selectedDetail)?.label || "";
    const styleLabel = styles.find(s => s.value === selectedStyle)?.label || "";
    const formatLabel = formats.find(f => f.value === selectedFormat)?.label || "";

    let prompt = `Actúa como un experto y ${goalTemplate}.\n\n`;
    
    if (customContext.trim()) {
      prompt += `Contexto específico: ${customContext}\n\n`;
    }
    
    prompt += `Instrucciones:\n`;
    prompt += `- Nivel de detalle: ${detailLabel}\n`;
    prompt += `- Estilo de comunicación: ${styleLabel}\n`;
    prompt += `- Formato de respuesta: ${formatLabel}\n\n`;
    
    switch (selectedGoal) {
      case "escribir":
        prompt += `Asegúrate de que el contenido sea original, bien estructurado y apropiado para la audiencia objetivo.`;
        break;
      case "analizar":
        prompt += `Proporciona un análisis objetivo, identifica patrones clave y ofrece conclusiones fundamentadas.`;
        break;
      case "traducir":
        prompt += `Mantén el tono y contexto originales, adaptando expresiones idiomáticas cuando sea necesario.`;
        break;
      case "resumir":
        prompt += `Captura los puntos más importantes sin perder el mensaje central del contenido original.`;
        break;
      case "codigo":
        prompt += `Incluye comentarios explicativos, manejo de errores básico y sigue las mejores prácticas del lenguaje.`;
        break;
      case "planificar":
        prompt += `Crea un plan realista con pasos claros, plazos sugeridos y consideraciones importantes.`;
        break;
      case "creatividad":
        prompt += `Piensa fuera de lo convencional, proporciona ideas variadas y considera diferentes perspectivas.`;
        break;
      case "educacion":
        prompt += `Usa analogías apropiadas, ejemplos prácticos y estructura la información de manera pedagógica.`;
        break;
    }

    setGeneratedPrompt(prompt);
  };

  const copyPrompt = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "¡Prompt copiado!",
        description: "El prompt ha sido copiado al portapapeles",
      });
    }
  };

  const resetBuilder = () => {
    setSelectedGoal("");
    setSelectedDetail("");
    setSelectedStyle("");
    setSelectedFormat("");
    setCustomContext("");
    setGeneratedPrompt("");
  };

  return (
    <section id="builder" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Prompt Builder <span className="text-primary">Interactivo</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Crea prompts personalizados paso a paso. Selecciona las opciones que mejor se adapten 
            a tu objetivo y obtén un prompt optimizado al instante.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Builder Form */}
            <Card className="shadow-card-custom animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-6 w-6 text-primary" />
                  <span>Configurador de Prompt</span>
                </CardTitle>
                <CardDescription>
                  Completa los campos para generar tu prompt personalizado
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Goal Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    ¿Cuál es tu objetivo? *
                  </label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona lo que quieres hacer" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Detail Level */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Nivel de detalle *
                  </label>
                  <Select value={selectedDetail} onValueChange={setSelectedDetail}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el nivel de profundidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {detailLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-muted-foreground">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Style Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Estilo de comunicación *
                  </label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elige el tono y estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs text-muted-foreground">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Formato de respuesta *
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="¿Cómo quieres la respuesta?" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((format) => (
                        <SelectItem key={format.value} value={format.value}>
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-muted-foreground">{format.example}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Context */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Contexto específico (opcional)
                  </label>
                  <Textarea
                    placeholder="Añade información específica sobre tu caso de uso, audiencia objetivo, restricciones especiales, etc."
                    value={customContext}
                    onChange={(e) => setCustomContext(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este contexto ayudará a personalizar aún más tu prompt
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={generatePrompt}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={!selectedGoal || !selectedDetail || !selectedStyle || !selectedFormat}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generar Prompt
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={resetBuilder}
                    className="px-4"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Prompt Display */}
            <Card className="shadow-card-custom animate-slide-up delay-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tu Prompt Generado</span>
                  {generatedPrompt && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyPrompt}
                      className="hover:bg-primary/10"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  El prompt aparecerá aquí una vez que completes la configuración
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {generatedPrompt ? (
                  <div className="space-y-4">
                    {/* Selected Options Summary */}
                    <div className="flex flex-wrap gap-2">
                      {selectedGoal && (
                        <Badge variant="secondary">
                          {goals.find(g => g.value === selectedGoal)?.label}
                        </Badge>
                      )}
                      {selectedDetail && (
                        <Badge variant="secondary">
                          {detailLevels.find(d => d.value === selectedDetail)?.label}
                        </Badge>
                      )}
                      {selectedStyle && (
                        <Badge variant="secondary">
                          {styles.find(s => s.value === selectedStyle)?.label}
                        </Badge>
                      )}
                      {selectedFormat && (
                        <Badge variant="secondary">
                          {formats.find(f => f.value === selectedFormat)?.label}
                        </Badge>
                      )}
                    </div>

                    {/* Generated Prompt */}
                    <div className="bg-muted/50 rounded-lg p-4 border-2 border-primary/20">
                      <pre className="whitespace-pre-wrap text-sm font-mono text-foreground leading-relaxed">
                        {generatedPrompt}
                      </pre>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      💡 Consejo: Puedes personalizar este prompt según tus necesidades específicas
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Completa la configuración para ver tu prompt personalizado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromptBuilder;
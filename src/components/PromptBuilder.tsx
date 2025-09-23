import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, RefreshCw, ChevronLeft, ChevronRight, User, Target, Users, Volume2, Palette, BookOpen, Shield, Plus, X, Save, ArrowUpDown, Settings, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { promptService } from "@/lib/services/promptService";
import debounce from "lodash.debounce";

type Mode = 'initial' | 'simple' | 'advanced';

// Tipos para modo sencillo (7 pilares + 2 extras)
interface SimplePromptData {
  rol: string;
  rolCustom: string;
  objetivo: string;
  audiencia: string[];
  formato: string;
  formatoColumnas: string[];
  formatoEncabezados: boolean;
  restricciones: string[];
  tono: string;
  voz: string;
  criterios: string[];
  contexto: string;
  ejemploEntrada: string;
  ejemploSalida: string;
}

// Tipos para modo avanzado (bloques)
interface AdvancedBlock {
  id: string;
  type: 'system' | 'user' | 'assistant' | 'cot' | 'react' | 'output' | 'restrictions' | 'audience' | 'variables' | 'rubric';
  title: string;
  content: string;
  enabled: boolean;
  order: number;
  config?: any;
}

interface AdvancedPromptData {
  blocks: AdvancedBlock[];
  variables: Record<string, string>;
  metadata: {
    title: string;
    difficulty: string;
    tags: string[];
  };
}

// Tipos para UI
interface SavePromptData {
  title: string;
  difficulty: string;
  tags: string[];
}

const PromptBuilder = () => {
  const { toast } = useToast();
  
  // Main state
  const [mode, setMode] = useState<Mode>('initial');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  
  // Simple mode data (7 pilares + 2 extras)
  const [simpleData, setSimpleData] = useState<SimplePromptData>({
    rol: '',
    rolCustom: '',
    objetivo: '',
    audiencia: [],
    formato: '',
    formatoColumnas: [],
    formatoEncabezados: false,
    restricciones: [],
    tono: '',
    voz: '',
    criterios: [],
    contexto: '',
    ejemploEntrada: '',
    ejemploSalida: ''
  });

  // Advanced mode data
  const [advancedData, setAdvancedData] = useState<AdvancedPromptData>({
    blocks: [],
    variables: {},
    metadata: {
      title: '',
      difficulty: '',
      tags: []
    }
  });

  // Save dialog data
  const [saveData, setSaveData] = useState<SavePromptData>({
    title: '',
    difficulty: '',
    tags: []
  });

  // Input helpers
  const [newItemInput, setNewItemInput] = useState('');
  const [newVariableName, setNewVariableName] = useState('');
  const [newVariableValue, setNewVariableValue] = useState('');

  // Helper functions para generar frases (7 pilares)
  const makeRol = (rol: string, rolCustom?: string): string => {
    if (!rol) return '';
    const finalRol = rol === 'Otro' ? rolCustom : rol;
    return finalRol ? `Actúa como ${finalRol}.` : '';
  };

  const makeObjetivo = (objetivo: string): string => {
    return objetivo ? `Tu objetivo es: ${objetivo}.` : '';
  };

  const makeAudiencia = (audiencias: string[]): string => {
    return audiencias.length > 0 ? `Adapta la respuesta a la audiencia: ${audiencias.join(', ')}.` : '';
  };

  const makeFormato = (formato: string, columnas?: string[], encabezados?: boolean): string => {
    if (!formato) return '';
    let detalleTabla = '';
    if (formato === 'Tabla' && columnas && columnas.length > 0) {
      detalleTabla = ` con columnas: ${columnas.join(', ')}`;
    }
    const encabezadosTexto = encabezados ? ' incluye titulares/encabezados' : '';
    return `Entrega la salida en formato ${formato}${detalleTabla}${encabezadosTexto}.`;
  };

  const makeRestricciones = (restricciones: string[]): string => {
    return restricciones.length > 0 ? `Cumple estas restricciones: ${restricciones.join('; ')}.` : '';
  };

  const makeTono = (tono: string, voz?: string): string => {
    if (!tono) return '';
    const vozTexto = voz && voz !== '' ? ` y voz ${voz}` : '';
    return `Usa un tono ${tono}${vozTexto}.`;
  };

  const makeCriterios = (criterios: string[]): string => {
    return criterios.length > 0 ? `Evalúa tu respuesta con foco en: ${criterios.join(' > ')}.` : '';
  };

  const makeContexto = (contexto: string): string => {
    return contexto ? `Contexto: ${contexto}.` : '';
  };

  const makeEjemplo = (entrada: string, salida: string): string => {
    return entrada && salida ? `Ejemplo: Entrada -> ${entrada}. Salida -> ${salida}.` : '';
  };

  // Array helpers
  const addToArray = (array: string[], item: string): string[] => {
    const trimmed = item.trim();
    if (trimmed && !array.includes(trimmed) && trimmed.length <= 50) {
      return [...array, trimmed];
    }
    return array;
  };

  const removeFromArray = (array: string[], index: number): string[] => {
    return array.filter((_, i) => i !== index);
  };

  // Generar prompt modo sencillo
  const generateSimplePrompt = useCallback((): string => {
    const parts = [
      makeRol(simpleData.rol, simpleData.rolCustom),
      makeObjetivo(simpleData.objetivo),
      makeAudiencia(simpleData.audiencia),
      makeFormato(simpleData.formato, simpleData.formatoColumnas, simpleData.formatoEncabezados),
      makeRestricciones(simpleData.restricciones),
      makeTono(simpleData.tono, simpleData.voz),
      makeCriterios(simpleData.criterios),
      makeContexto(simpleData.contexto),
      makeEjemplo(simpleData.ejemploEntrada, simpleData.ejemploSalida)
    ];
    
    return parts.filter(Boolean).join('\n\n');
  }, [simpleData]);

  // Generar prompt modo avanzado
  const generateAdvancedPrompt = useCallback((): string => {
    const sortedBlocks = advancedData.blocks
      .filter(block => block.enabled && block.content.trim())
      .sort((a, b) => a.order - b.order);

    let prompt = '';
    
    sortedBlocks.forEach(block => {
      let content = block.content;
      
      // Reemplazar variables
      Object.entries(advancedData.variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        content = content.replace(regex, value);
      });

      switch (block.type) {
        case 'system':
          prompt += `[SYSTEM]\n${content}\n\n`;
          break;
        case 'user':
          prompt += `[USER]\n${content}\n\n`;
          break;
        case 'assistant':
          prompt += `[ASSISTANT]\n${content}\n\n`;
          break;
        default:
          prompt += `${block.title}:\n${content}\n\n`;
      }
    });

    return prompt.trim();
  }, [advancedData]);

  // Debounced prompt generation
  const debouncedGenerate = useMemo(() => 
    debounce(() => {
      const newPrompt = mode === 'simple' ? generateSimplePrompt() : generateAdvancedPrompt();
      setGeneratedPrompt(newPrompt);
      setCharacterCount(newPrompt.length);
    }, 300)
  , [mode, generateSimplePrompt, generateAdvancedPrompt]);

  // Effect to regenerate prompt when data changes
  useEffect(() => {
    if (mode !== 'initial') {
      debouncedGenerate();
    }
    return () => {
      debouncedGenerate.cancel();
    };
  }, [simpleData, advancedData, mode, debouncedGenerate]);

  // Copy to clipboard
  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast({
        title: "Copiado ✓",
        description: "Prompt copiado al portapapeles",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  }, [generatedPrompt, toast]);

  // Export as .txt
  const exportPrompt = useCallback(() => {
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exportado ✓",
      description: "Prompt exportado como archivo .txt",
    });
  }, [generatedPrompt, toast]);

  // Reset builder
  const resetBuilder = useCallback(() => {
    setSimpleData({
      rol: '',
      rolCustom: '',
      objetivo: '',
      audiencia: [],
      formato: '',
      formatoColumnas: [],
      formatoEncabezados: false,
      restricciones: [],
      tono: '',
      voz: '',
      criterios: [],
      contexto: '',
      ejemploEntrada: '',
      ejemploSalida: ''
    });
    setAdvancedData({
      blocks: [],
      variables: {},
      metadata: {
        title: '',
        difficulty: '',
        tags: []
      }
    });
    setGeneratedPrompt('');
    setCharacterCount(0);
    setMode('initial');
    
    toast({
      title: "Restablecido ✓",
      description: "Generador restablecido",
    });
  }, [toast]);

  // Save prompt
  const savePrompt = useCallback(async () => {
    if (!saveData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await promptService.create({
        title: saveData.title.trim(),
        difficulty: saveData.difficulty as 'facil' | 'media' | 'dificil',
        body: generatedPrompt,
        tags: saveData.tags.filter(Boolean)
      });
      
      toast({
        title: "Guardado ✓",
        description: "Prompt guardado exitosamente",
      });
      
      setSaveDialogOpen(false);
      setSaveData({
        title: '',
        difficulty: '',
        tags: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el prompt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [saveData, generatedPrompt, toast]);

  // Initial mode selection screen
  const renderInitialScreen = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Generador de Prompts</h1>
        <p className="text-muted-foreground">Elige el modo que prefieras para crear tu prompt perfecto</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('simple')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Modo Sencillo
            </CardTitle>
            <CardDescription>
              Asistente paso a paso con los 7 pilares fundamentales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Perfecto para:</p>
              <ul className="text-sm space-y-1">
                <li>• Crear prompts rápidamente</li>
                <li>• Usuarios principiantes</li>
                <li>• Estructura guiada</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('advanced')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Modo Avanzado
            </CardTitle>
            <CardDescription>
              Bloques reordenables, variables y funciones avanzadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Perfecto para:</p>
              <ul className="text-sm space-y-1">
                <li>• Control total del prompt</li>
                <li>• Usuarios experimentados</li>
                <li>• Prompts complejos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Simple mode components
  const SimpleStepCard = ({ title, children, step }: { title: string; children: React.ReactNode; step: number }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline">{step}</Badge>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );

  const ChipInput = ({ 
    items, 
    onAdd, 
    onRemove, 
    placeholder, 
    maxItems = 10 
  }: { 
    items: string[]; 
    onAdd: (item: string) => void; 
    onRemove: (index: number) => void; 
    placeholder: string;
    maxItems?: number;
  }) => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newItemInput}
          onChange={(e) => setNewItemInput(e.target.value)}
          placeholder={placeholder}
          maxLength={50}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (newItemInput.trim() && items.length < maxItems) {
                onAdd(newItemInput.trim());
                setNewItemInput('');
              }
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (newItemInput.trim() && items.length < maxItems) {
              onAdd(newItemInput.trim());
              setNewItemInput('');
            }
          }}
          disabled={!newItemInput.trim() || items.length >= maxItems}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4 h-4"
                onClick={() => onRemove(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        {items.length}/{maxItems} elementos
      </p>
    </div>
  );

  // Simple mode render
  const renderSimpleMode = () => (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Modo Sencillo</h2>
          <Button variant="outline" onClick={() => setMode('initial')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Pilar 1: Rol del modelo */}
        <SimpleStepCard title="Rol del modelo" step={1}>
          <div className="space-y-4">
            <Select value={simpleData.rol} onValueChange={(value) => setSimpleData(prev => ({ ...prev, rol: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="¿Quién debe ser el asistente?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Experto en [campo]">Experto en [campo]</SelectItem>
                <SelectItem value="Profesor de [nivel]">Profesor de [nivel]</SelectItem>
                <SelectItem value="Consultor de negocio">Consultor de negocio</SelectItem>
                <SelectItem value="Redactor técnico">Redactor técnico</SelectItem>
                <SelectItem value="Analista de datos">Analista de datos</SelectItem>
                <SelectItem value="Traductor y corrector">Traductor y corrector</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            
            {simpleData.rol === 'Otro' && (
              <Input
                value={simpleData.rolCustom}
                onChange={(e) => setSimpleData(prev => ({ ...prev, rolCustom: e.target.value }))}
                placeholder="Describe el rol personalizado"
              />
            )}
          </div>
        </SimpleStepCard>

        {/* Pilar 2: Objetivo principal */}
        <SimpleStepCard title="Objetivo principal" step={2}>
          <div className="space-y-4">
            <Textarea
              value={simpleData.objetivo}
              onChange={(e) => setSimpleData(prev => ({ ...prev, objetivo: e.target.value }))}
              placeholder="¿Qué quieres que haga exactamente?"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              {['resumir un texto', 'comparar dos opciones', 'explicar un concepto', 'hacer un checklist', 'redactar un correo', 'generar ideas'].map(chip => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSimpleData(prev => ({ ...prev, objetivo: prev.objetivo + (prev.objetivo ? ', ' : '') + chip }))}
                >
                  {chip}
                </Badge>
              ))}
            </div>
          </div>
        </SimpleStepCard>

        {/* Pilar 3: Audiencia */}
        <SimpleStepCard title="Audiencia / Destinatario" step={3}>
          <ChipInput
            items={simpleData.audiencia}
            onAdd={(item) => setSimpleData(prev => ({ ...prev, audiencia: addToArray(prev.audiencia, item) }))}
            onRemove={(index) => setSimpleData(prev => ({ ...prev, audiencia: removeFromArray(prev.audiencia, index) }))}
            placeholder="Ej: Directivos, Equipo técnico..."
          />
        </SimpleStepCard>

        {/* Pilar 4: Formato de salida */}
        <SimpleStepCard title="Formato de salida" step={4}>
          <div className="space-y-4">
            <Select value={simpleData.formato} onValueChange={(value) => setSimpleData(prev => ({ ...prev, formato: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lista">Lista</SelectItem>
                <SelectItem value="Tabla">Tabla</SelectItem>
                <SelectItem value="Párrafos">Párrafos</SelectItem>
                <SelectItem value="Pasos numerados">Pasos numerados</SelectItem>
                <SelectItem value="JSON estructurado">JSON estructurado</SelectItem>
              </SelectContent>
            </Select>

            {simpleData.formato === 'Tabla' && (
              <ChipInput
                items={simpleData.formatoColumnas}
                onAdd={(item) => setSimpleData(prev => ({ ...prev, formatoColumnas: addToArray(prev.formatoColumnas, item) }))}
                onRemove={(index) => setSimpleData(prev => ({ ...prev, formatoColumnas: removeFromArray(prev.formatoColumnas, index) }))}
                placeholder="Nombre de la columna"
                maxItems={6}
              />
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="encabezados"
                checked={simpleData.formatoEncabezados}
                onCheckedChange={(checked) => setSimpleData(prev => ({ ...prev, formatoEncabezados: Boolean(checked) }))}
              />
              <label htmlFor="encabezados" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Incluir titulares/encabezados
              </label>
            </div>
          </div>
        </SimpleStepCard>

        {/* Pilar 5: Requisitos/Restricciones */}
        <SimpleStepCard title="Requisitos / Restricciones" step={5}>
          <ChipInput
            items={simpleData.restricciones}
            onAdd={(item) => setSimpleData(prev => ({ ...prev, restricciones: addToArray(prev.restricciones, item) }))}
            onRemove={(index) => setSimpleData(prev => ({ ...prev, restricciones: removeFromArray(prev.restricciones, index) }))}
            placeholder="Ej: máx. 150 palabras, tono formal..."
          />
        </SimpleStepCard>

        {/* Pilar 6: Tono y voz */}
        <SimpleStepCard title="Tono y voz" step={6}>
          <div className="space-y-4">
            <Select value={simpleData.tono} onValueChange={(value) => setSimpleData(prev => ({ ...prev, tono: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tono" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Profesional">Profesional</SelectItem>
                <SelectItem value="Didáctico">Didáctico</SelectItem>
                <SelectItem value="Persuasivo">Persuasivo</SelectItem>
                <SelectItem value="Creativo">Creativo</SelectItem>
                <SelectItem value="Neutro">Neutro</SelectItem>
                <SelectItem value="Humano y cercano">Humano y cercano</SelectItem>
              </SelectContent>
            </Select>

            <Select value={simpleData.voz} onValueChange={(value) => setSimpleData(prev => ({ ...prev, voz: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Voz (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activa">Activa</SelectItem>
                <SelectItem value="pasiva">Pasiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </SimpleStepCard>

        {/* Pilar 7: Calidad / Criterios */}
        <SimpleStepCard title="Calidad / Criterios de evaluación" step={7}>
          <ChipInput
            items={simpleData.criterios}
            onAdd={(item) => setSimpleData(prev => ({ ...prev, criterios: addToArray(prev.criterios, item) }))}
            onRemove={(index) => setSimpleData(prev => ({ ...prev, criterios: removeFromArray(prev.criterios, index) }))}
            placeholder="Ej: Claridad, Precisión, Estructura..."
          />
        </SimpleStepCard>

        {/* Extra 1: Contexto */}
        <SimpleStepCard title="Contexto breve (opcional)" step={8}>
          <Textarea
            value={simpleData.contexto}
            onChange={(e) => setSimpleData(prev => ({ ...prev, contexto: e.target.value }))}
            placeholder="Proporciona contexto adicional..."
            maxLength={500}
            rows={2}
          />
          <p className="text-xs text-muted-foreground">
            {simpleData.contexto.length}/500 caracteres
          </p>
        </SimpleStepCard>

        {/* Extra 2: Ejemplo */}
        <SimpleStepCard title="Ejemplo único (opcional)" step={9}>
          <div className="space-y-3">
            <Input
              value={simpleData.ejemploEntrada}
              onChange={(e) => setSimpleData(prev => ({ ...prev, ejemploEntrada: e.target.value }))}
              placeholder="Ejemplo de entrada"
            />
            <Textarea
              value={simpleData.ejemploSalida}
              onChange={(e) => setSimpleData(prev => ({ ...prev, ejemploSalida: e.target.value }))}
              placeholder="Ejemplo de salida esperada"
              rows={2}
            />
          </div>
        </SimpleStepCard>
      </div>

      {/* Vista previa */}
      <div className="space-y-6">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Vista Previa</CardTitle>
            <CardDescription>
              Caracteres: {characterCount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedPrompt}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="Tu prompt aparecerá aquí mientras lo construyes..."
            />
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyPrompt} disabled={!generatedPrompt}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!generatedPrompt}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Guardar Prompt</DialogTitle>
                    <DialogDescription>
                      Completa la información para guardar tu prompt
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={saveData.title}
                      onChange={(e) => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título del prompt"
                    />
                    <Select value={saveData.difficulty} onValueChange={(value) => setSaveData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la dificultad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facil">Fácil</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="dificil">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                    <ChipInput
                      items={saveData.tags}
                      onAdd={(item) => setSaveData(prev => ({ ...prev, tags: addToArray(prev.tags, item) }))}
                      onRemove={(index) => setSaveData(prev => ({ ...prev, tags: removeFromArray(prev.tags, index) }))}
                      placeholder="Etiqueta"
                      maxItems={5}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={savePrompt} disabled={isSaving || !saveData.title.trim()}>
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={exportPrompt} disabled={!generatedPrompt}>
                <Download className="h-4 w-4 mr-2" />
                Exportar .txt
              </Button>
              
              <Button variant="outline" onClick={resetBuilder}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Advanced mode render - básico por ahora
  const renderAdvancedMode = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Modo Avanzado</h2>
        <Button variant="outline" onClick={() => setMode('initial')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Brain className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Modo Avanzado en Construcción</h3>
            <p className="text-muted-foreground">
              Esta funcionalidad estará disponible próximamente con bloques reordenables, 
              variables, plantillas y funciones avanzadas.
            </p>
            <Button onClick={() => setMode('simple')}>
              Usar Modo Sencillo por ahora
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-background">
      {mode === 'initial' && renderInitialScreen()}
      {mode === 'simple' && renderSimpleMode()}
      {mode === 'advanced' && renderAdvancedMode()}
    </div>
  );
};

export default PromptBuilder;
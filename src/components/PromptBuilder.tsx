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
  config?: {
    cotOptions?: {
      pasos: boolean;
      preguntas: boolean;
      verificacion: boolean;
    };
    reactFormat?: string;
    jsonSchema?: string;
    audienceProfile?: {
      tech: number;
      hurry: number;
      visual: number;
    };
    tableColumns?: string[];
    requiredSections?: string[];
  };
}

interface AdvancedPromptData {
  blocks: AdvancedBlock[];
  variables: Record<string, string>;
  templates: Record<string, AdvancedPromptData>;
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
    templates: {}
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
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

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

  // Advanced mode helpers
  const validateVariableName = (name: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  };

  const addVariable = (name: string, value: string) => {
    if (!validateVariableName(name) || !name.trim() || !value.trim()) return;
    setAdvancedData(prev => ({
      ...prev,
      variables: { ...prev.variables, [name.trim()]: value.trim() }
    }));
    setNewVariableName('');
    setNewVariableValue('');
  };

  const removeVariable = (name: string) => {
    setAdvancedData(prev => {
      const { [name]: removed, ...rest } = prev.variables;
      return { ...prev, variables: rest };
    });
  };

  const addBlock = (type: AdvancedBlock['type']) => {
    const id = Date.now().toString();
    const titles = {
      system: 'System Message',
      user: 'User Instruction', 
      assistant: 'Assistant Example',
      cot: 'Chain of Thought',
      react: 'ReAct Reasoning',
      output: 'Output Structure',
      restrictions: 'Advanced Restrictions',
      audience: 'Audience Profile',
      variables: 'Variables',
      rubric: 'Evaluation Rubric'
    };

    const newBlock: AdvancedBlock = {
      id,
      type,
      title: titles[type],
      content: '',
      enabled: true,
      order: advancedData.blocks.length,
      config: type === 'audience' ? { audienceProfile: { tech: 3, hurry: 3, visual: 3 } } : {}
    };

    setAdvancedData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const updateBlock = (id: string, updates: Partial<AdvancedBlock>) => {
    setAdvancedData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    }));
  };

  const removeBlock = (id: string) => {
    setAdvancedData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== id)
    }));
  };

  const reorderBlocks = (dragIndex: number, hoverIndex: number) => {
    setAdvancedData(prev => {
      const newBlocks = [...prev.blocks];
      const draggedBlock = newBlocks[dragIndex];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      
      // Update order
      return {
        ...prev,
        blocks: newBlocks.map((block, index) => ({ ...block, order: index }))
      };
    });
  };

  // Advanced helpers for prompt generation
  const makeCoT = (config?: { pasos?: boolean; preguntas?: boolean; verificacion?: boolean }): string => {
    if (!config) return '';
    let cotText = 'Piensa paso a paso. Razona en silencio y presenta solo la respuesta final a menos que pida lo contrario.';
    if (config.verificacion) {
      cotText += '\nValida tu respuesta con una comprobación breve.';
    }
    return cotText;
  };

  const makeJSONSchema = (schema: string): string => {
    return schema ? `Estructura de salida (JSON):\n${schema}` : '';
  };

  const makeAudienciaAvanzada = (profile?: { tech?: number; hurry?: number; visual?: number }): string => {
    if (!profile) return '';
    const { tech = 3, hurry = 3, visual = 3 } = profile;
    return `Asume audiencia con conocimiento técnico ${tech}/5, prisa ${hurry}/5 y preferencia visual ${visual}/5.`;
  };

  const makeChecklist = (items: string[]): string => {
    return items.length > 0 ? `Antes de finalizar, verifica: ${items.join(', ')}.` : '';
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
        case 'cot':
          const cotText = makeCoT(block.config?.cotOptions);
          prompt += `Instrucciones de razonamiento:\n${cotText}\n\n`;
          break;
        case 'output':
          if (block.config?.jsonSchema) {
            prompt += `${makeJSONSchema(block.config.jsonSchema)}\n\n`;
          }
          if (content) {
            prompt += `${block.title}:\n${content}\n\n`;
          }
          break;
        case 'audience':
          const audienceText = makeAudienciaAvanzada(block.config?.audienceProfile);
          prompt += `Audiencia:\n${audienceText}\n\n`;
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
      templates: {}
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

  // Advanced mode components
  const VariablePanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Variables
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newVariableName}
            onChange={(e) => setNewVariableName(e.target.value)}
            placeholder="Nombre (ej: producto)"
            className="flex-1"
          />
          <Input
            value={newVariableValue}
            onChange={(e) => setNewVariableValue(e.target.value)}
            placeholder="Valor"
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => addVariable(newVariableName, newVariableValue)}
            disabled={!validateVariableName(newVariableName) || !newVariableName.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {Object.entries(advancedData.variables).length > 0 && (
          <div className="space-y-2">
            {Object.entries(advancedData.variables).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2 p-2 border rounded">
                <code className="text-sm">${name}</code>
                <span className="text-sm text-muted-foreground flex-1 truncate">= {value}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(name)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const BlockCard = ({ block }: { block: AdvancedBlock }) => (
    <Card className={`transition-all ${block.enabled ? '' : 'opacity-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-grab active:cursor-grabbing"
                onDragStart={(e) => {
                  setDraggedBlock(block.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                draggable
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
              <Checkbox
                checked={block.enabled}
                onCheckedChange={(checked) => updateBlock(block.id, { enabled: Boolean(checked) })}
              />
            </div>
            {block.title}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeBlock(block.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Configuración específica por tipo de bloque */}
        {block.type === 'cot' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${block.id}-pasos`}
                  checked={block.config?.cotOptions?.pasos}
                  onCheckedChange={(checked) => updateBlock(block.id, {
                    config: {
                      ...block.config,
                      cotOptions: { ...block.config?.cotOptions, pasos: Boolean(checked) }
                    }
                  })}
                />
                <label htmlFor={`${block.id}-pasos`} className="text-sm">Lista de pasos</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${block.id}-preguntas`}
                  checked={block.config?.cotOptions?.preguntas}
                  onCheckedChange={(checked) => updateBlock(block.id, {
                    config: {
                      ...block.config,
                      cotOptions: { ...block.config?.cotOptions, preguntas: Boolean(checked) }
                    }
                  })}
                />
                <label htmlFor={`${block.id}-preguntas`} className="text-sm">Preguntas intermedias</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${block.id}-verificacion`}
                  checked={block.config?.cotOptions?.verificacion}
                  onCheckedChange={(checked) => updateBlock(block.id, {
                    config: {
                      ...block.config,
                      cotOptions: { ...block.config?.cotOptions, verificacion: Boolean(checked) }
                    }
                  })}
                />
                <label htmlFor={`${block.id}-verificacion`} className="text-sm">Verificación final</label>
              </div>
            </div>
          </div>
        )}

        {block.type === 'audience' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Conocimiento técnico: {block.config?.audienceProfile?.tech || 3}/5</label>
              <input
                type="range"
                min="0"
                max="5"
                value={block.config?.audienceProfile?.tech || 3}
                onChange={(e) => updateBlock(block.id, {
                  config: {
                    ...block.config,
                    audienceProfile: { 
                      ...block.config?.audienceProfile, 
                      tech: parseInt(e.target.value) 
                    }
                  }
                })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prisa: {block.config?.audienceProfile?.hurry || 3}/5</label>
              <input
                type="range"
                min="0"
                max="5"
                value={block.config?.audienceProfile?.hurry || 3}
                onChange={(e) => updateBlock(block.id, {
                  config: {
                    ...block.config,
                    audienceProfile: { 
                      ...block.config?.audienceProfile, 
                      hurry: parseInt(e.target.value) 
                    }
                  }
                })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferencia visual: {block.config?.audienceProfile?.visual || 3}/5</label>
              <input
                type="range"
                min="0"
                max="5"
                value={block.config?.audienceProfile?.visual || 3}
                onChange={(e) => updateBlock(block.id, {
                  config: {
                    ...block.config,
                    audienceProfile: { 
                      ...block.config?.audienceProfile, 
                      visual: parseInt(e.target.value) 
                    }
                  }
                })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {block.type === 'output' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${block.id}-json`}
                checked={!!block.config?.jsonSchema}
                onCheckedChange={(checked) => updateBlock(block.id, {
                  config: {
                    ...block.config,
                    jsonSchema: checked ? '{\n  "campo": "tipo"\n}' : undefined
                  }
                })}
              />
              <label htmlFor={`${block.id}-json`} className="text-sm">JSON Schema</label>
            </div>
            
            {block.config?.jsonSchema && (
              <Textarea
                value={block.config.jsonSchema}
                onChange={(e) => updateBlock(block.id, {
                  config: { ...block.config, jsonSchema: e.target.value }
                })}
                placeholder='{ "campo": "tipo" }'
                rows={3}
              />
            )}
          </div>
        )}

        <Textarea
          value={block.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          placeholder={`Contenido del bloque ${block.title}...`}
          rows={3}
        />

        {Object.keys(advancedData.variables).length > 0 && (
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground">Variables:</span>
            {Object.keys(advancedData.variables).map(name => (
              <Button
                key={name}
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  const textarea = document.querySelector(`textarea[value="${block.content}"]`) as HTMLTextAreaElement;
                  if (textarea) {
                    const cursor = textarea.selectionStart;
                    const newContent = block.content.slice(0, cursor) + `\${${name}}` + block.content.slice(cursor);
                    updateBlock(block.id, { content: newContent });
                  }
                }}
              >
                ${name}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
          <div className="flex flex-wrap gap-2 mt-2">
            {['Directivos', 'Equipo técnico', 'Clientes', 'Principiantes', 'Público general', 'Reclutadores'].map(chip => (
              <Badge
                key={chip}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSimpleData(prev => ({ ...prev, audiencia: addToArray(prev.audiencia, chip) }))}
              >
                {chip}
              </Badge>
            ))}
          </div>
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
          <div className="flex flex-wrap gap-2 mt-2">
            {['máx. 150 palabras', 'tono formal', 'sin jerga', 'cita fuentes', 'incluye ejemplos'].map(chip => (
              <Badge
                key={chip}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSimpleData(prev => ({ ...prev, restricciones: addToArray(prev.restricciones, chip) }))}
              >
                {chip}
              </Badge>
            ))}
          </div>
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
          <div className="flex flex-wrap gap-2 mt-2">
            {['Claridad', 'Precisión', 'Estructura', 'Cobertura', 'Rigor', 'Originalidad'].map(chip => (
              <Badge
                key={chip}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => setSimpleData(prev => ({ ...prev, criterios: addToArray(prev.criterios, chip) }))}
              >
                {chip}
              </Badge>
            ))}
          </div>
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

  // Advanced mode render
  const renderAdvancedMode = () => (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Modo Avanzado</h2>
          <Button variant="outline" onClick={() => setMode('initial')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <VariablePanel />

        <Card>
          <CardHeader>
            <CardTitle>Bloques Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('system')}
                className="justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                System
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('user')}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                User
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('assistant')}
                className="justify-start"
              >
                <Brain className="h-4 w-4 mr-2" />
                Assistant
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('cot')}
                className="justify-start"
              >
                <Target className="h-4 w-4 mr-2" />
                CoT
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('react')}
                className="justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                ReAct
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('output')}
                className="justify-start"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Output
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('restrictions')}
                className="justify-start"
              >
                <Shield className="h-4 w-4 mr-2" />
                Restrictions
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock('audience')}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Audience
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {advancedData.blocks
            .sort((a, b) => a.order - b.order)
            .map((block) => (
              <div
                key={block.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedBlock && draggedBlock !== block.id) {
                    const draggedIndex = advancedData.blocks.findIndex(b => b.id === draggedBlock);
                    const targetIndex = advancedData.blocks.findIndex(b => b.id === block.id);
                    reorderBlocks(draggedIndex, targetIndex);
                  }
                  setDraggedBlock(null);
                }}
              >
                <BlockCard block={block} />
              </div>
            ))}
        </div>
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
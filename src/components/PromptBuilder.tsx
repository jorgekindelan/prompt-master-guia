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
import { Copy, Download, RefreshCw, ChevronLeft, ChevronRight, User, Target, Users, Volume2, Palette, BookOpen, Shield, Plus, X, Save, ArrowUpDown, Settings, Brain, FileText, Code, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { promptService } from "@/lib/services/promptService";
import debounce from "lodash.debounce";

type Mode = 'initial' | 'simple' | 'advanced';
type PromptFormat = 'text' | 'html' | 'json';
type SimpleStep = 'rol' | 'objetivo' | 'audiencia' | 'formato' | 'restricciones' | 'tono' | 'criterios' | 'extras';

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

// Configuración de pasos del wizard
const WIZARD_STEPS: { 
  id: SimpleStep; 
  title: string; 
  icon: React.ComponentType<any>; 
  required: boolean; 
}[] = [
  { id: 'rol', title: 'Rol', icon: User, required: true },
  { id: 'objetivo', title: 'Objetivo', icon: Target, required: true },
  { id: 'audiencia', title: 'Audiencia', icon: Users, required: false },
  { id: 'formato', title: 'Formato', icon: FileText, required: true },
  { id: 'restricciones', title: 'Restricciones', icon: Shield, required: false },
  { id: 'tono', title: 'Tono', icon: Volume2, required: false },
  { id: 'criterios', title: 'Criterios', icon: BookOpen, required: false },
  { id: 'extras', title: 'Extras', icon: Plus, required: false },
];

const PromptBuilder = () => {
  const { toast } = useToast();
  
  // Main state
  const [mode, setMode] = useState<Mode>('initial');
  const [currentStep, setCurrentStep] = useState<SimpleStep>('rol');
  const [promptFormat, setPromptFormat] = useState<PromptFormat>('text');
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
    if (trimmed && !array.some(existing => existing.toLowerCase() === trimmed.toLowerCase()) && trimmed.length <= 50) {
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

  // Formato de salida - HTML-like
  const generateHtmlLikePrompt = useCallback((): string => {
    if (mode === 'simple') {
      const escapeHtml = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let prompt = '';
      
      if (simpleData.rol) {
        const rolFinal = simpleData.rol === 'Otro' ? simpleData.rolCustom : simpleData.rol;
        if (rolFinal) prompt += `<rol>${escapeHtml(rolFinal)}</rol>\n`;
      }
      if (simpleData.objetivo) prompt += `<objetivo>${escapeHtml(simpleData.objetivo)}</objetivo>\n`;
      if (simpleData.audiencia.length > 0) prompt += `<audiencia>${escapeHtml(simpleData.audiencia.join(', '))}</audiencia>\n`;
      if (simpleData.formato) {
        let formatoText = simpleData.formato;
        if (simpleData.formato === 'Tabla' && simpleData.formatoColumnas.length > 0) {
          formatoText += ` con columnas: ${simpleData.formatoColumnas.join(', ')}`;
        }
        if (simpleData.formatoEncabezados) formatoText += ' incluye titulares/encabezados';
        prompt += `<formato>${escapeHtml(formatoText)}</formato>\n`;
      }
      if (simpleData.restricciones.length > 0) prompt += `<restricciones>${escapeHtml(simpleData.restricciones.join('; '))}</restricciones>\n`;
      if (simpleData.tono) {
        let tonoText = simpleData.tono;
        if (simpleData.voz) tonoText += ` y voz ${simpleData.voz}`;
        prompt += `<tono>${escapeHtml(tonoText)}</tono>\n`;
      }
      if (simpleData.criterios.length > 0) prompt += `<criterios>${escapeHtml(simpleData.criterios.join(' > '))}</criterios>\n`;
      if (simpleData.contexto) prompt += `<contexto>${escapeHtml(simpleData.contexto)}</contexto>\n`;
      if (simpleData.ejemploEntrada && simpleData.ejemploSalida) {
        prompt += `<ejemplo>\n<entrada>${escapeHtml(simpleData.ejemploEntrada)}</entrada>\n<salida>${escapeHtml(simpleData.ejemploSalida)}</salida>\n</ejemplo>\n`;
      }
      
      return prompt.trim();
    } else {
      // Advanced mode HTML-like formatting
      const sortedBlocks = advancedData.blocks
        .filter(block => block.enabled && block.content.trim())
        .sort((a, b) => a.order - b.order);

      let prompt = '';
      const escapeHtml = (text: string) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      
      sortedBlocks.forEach(block => {
        let content = block.content;
        
        // Reemplazar variables
        Object.entries(advancedData.variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
          content = content.replace(regex, value);
        });

        const tagName = block.type === 'cot' ? 'cot' : 
                       block.type === 'react' ? 'react' :
                       block.type === 'output' ? 'estructura' :
                       block.type === 'audience' ? 'audiencia_avanzada' :
                       block.type === 'restrictions' ? 'restricciones' :
                       block.type === 'rubric' ? 'checklist' :
                       block.type;

        prompt += `<${tagName}>${escapeHtml(content)}</${tagName}>\n`;
      });

      return prompt.trim();
    }
  }, [mode, simpleData, advancedData]);

  // Formato de salida - JSON
  const generateJsonPrompt = useCallback((): string => {
    if (mode === 'simple') {
      const jsonObj: any = {};
      
      if (simpleData.rol) {
        jsonObj.rol = simpleData.rol === 'Otro' ? simpleData.rolCustom : simpleData.rol;
      }
      if (simpleData.objetivo) jsonObj.objetivo = simpleData.objetivo;
      if (simpleData.audiencia.length > 0) jsonObj.audiencia = simpleData.audiencia;
      if (simpleData.formato) {
        jsonObj.formato = { tipo: simpleData.formato };
        if (simpleData.formato === 'Tabla' && simpleData.formatoColumnas.length > 0) {
          jsonObj.formato.columnas = simpleData.formatoColumnas;
        }
        if (simpleData.formatoEncabezados) jsonObj.formato.encabezados = true;
      }
      if (simpleData.restricciones.length > 0) jsonObj.restricciones = simpleData.restricciones;
      if (simpleData.tono) {
        jsonObj.tono = { tono: simpleData.tono };
        if (simpleData.voz) jsonObj.tono.voz = simpleData.voz;
      }
      if (simpleData.criterios.length > 0) jsonObj.criterios = simpleData.criterios;
      if (simpleData.contexto) jsonObj.contexto = simpleData.contexto;
      if (simpleData.ejemploEntrada && simpleData.ejemploSalida) {
        jsonObj.ejemplo = {
          entrada: simpleData.ejemploEntrada,
          salida: simpleData.ejemploSalida
        };
      }
      
      return JSON.stringify(jsonObj, null, 2);
    } else {
      // Advanced mode JSON formatting
      const sortedBlocks = advancedData.blocks
        .filter(block => block.enabled && block.content.trim())
        .sort((a, b) => a.order - b.order);

      const jsonObj: any = {};
      const messages: any[] = [];
      
      sortedBlocks.forEach(block => {
        let content = block.content;
        
        // Reemplazar variables
        Object.entries(advancedData.variables).forEach(([key, value]) => {
          const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
          content = content.replace(regex, value);
        });

        switch (block.type) {
          case 'system':
            jsonObj.system = content;
            break;
          case 'user':
            messages.push({ role: 'user', content });
            break;
          case 'assistant':
            messages.push({ role: 'assistant', content });
            break;
          case 'cot':
            jsonObj.cot = {
              step_by_step: block.config?.cotOptions?.pasos || false,
              questions: block.config?.cotOptions?.preguntas || false,
              verify: block.config?.cotOptions?.verificacion || false
            };
            break;
          case 'react':
            jsonObj.react = {
              trace_format: block.config?.reactFormat || 'json thought/action/observation'
            };
            break;
          case 'output':
            if (block.config?.jsonSchema) {
              jsonObj.estructura = { schema_json: block.config.jsonSchema };
            }
            break;
          case 'audience':
            const profile = block.config?.audienceProfile;
            if (profile) {
              jsonObj.audiencia_avanzada = {
                tecnico: profile.tech,
                prisa: profile.hurry,
                visual: profile.visual
              };
            }
            break;
          case 'restrictions':
            if (!jsonObj.restricciones) jsonObj.restricciones = [];
            jsonObj.restricciones.push(content);
            break;
          case 'rubric':
            if (!jsonObj.checklist) jsonObj.checklist = [];
            jsonObj.checklist.push(content);
            break;
        }
      });
      
      if (messages.length > 0) jsonObj.messages = messages;
      
      return JSON.stringify(jsonObj, null, 2);
    }
  }, [mode, simpleData, advancedData]);

  // Generar prompt final según formato seleccionado
  const generateFinalPrompt = useCallback((): string => {
    switch (promptFormat) {
      case 'html':
        return generateHtmlLikePrompt();
      case 'json':
        return generateJsonPrompt();
      default:
        return mode === 'simple' ? generateSimplePrompt() : generateAdvancedPrompt();
    }
  }, [promptFormat, mode, generateSimplePrompt, generateAdvancedPrompt, generateHtmlLikePrompt, generateJsonPrompt]);

  // Debounced prompt generation
  const debouncedGenerate = useMemo(() => 
    debounce(() => {
      const newPrompt = generateFinalPrompt();
      setGeneratedPrompt(newPrompt);
      setCharacterCount(newPrompt.length);
    }, 300)
  , [generateFinalPrompt]);

  // Effect to regenerate prompt when data changes
  useEffect(() => {
    if (mode !== 'initial') {
      debouncedGenerate();
    }
    return () => {
      debouncedGenerate.cancel();
    };
  }, [simpleData, advancedData, mode, promptFormat, debouncedGenerate]);

  // Validaciones de pasos
  const isStepValid = useCallback((step: SimpleStep): boolean => {
    switch (step) {
      case 'rol':
        return Boolean(simpleData.rol && (simpleData.rol !== 'Otro' || simpleData.rolCustom));
      case 'objetivo':
        return Boolean(simpleData.objetivo.trim());
      case 'formato':
        return Boolean(simpleData.formato && (simpleData.formato !== 'Tabla' || simpleData.formatoColumnas.length > 0));
      default:
        return true; // Otros pasos no son obligatorios
    }
  }, [simpleData]);

  const canNavigateToStep = useCallback((step: SimpleStep): boolean => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    
    // Puede navegar hacia atrás siempre
    if (stepIndex <= currentIndex) return true;
    
    // Para navegar hacia adelante, verificar pasos previos obligatorios
    for (let i = 0; i < stepIndex; i++) {
      const prevStep = WIZARD_STEPS[i];
      if (prevStep.required && !isStepValid(prevStep.id)) {
        return false;
      }
    }
    return true;
  }, [currentStep, isStepValid]);

  const getStepStatus = useCallback((step: SimpleStep): 'current' | 'completed' | 'pending' | 'error' => {
    if (step === currentStep) return 'current';
    
    const stepIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) {
      const stepConfig = WIZARD_STEPS.find(s => s.id === step);
      if (stepConfig?.required && !isStepValid(step)) return 'error';
      return 'completed';
    }
    
    return 'pending';
  }, [currentStep, isStepValid]);

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
    setCurrentStep('rol');
    setMode('initial');
    setPromptFormat('text');
    
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
      const cleanTags = saveData.tags.filter(tag => tag && tag.trim());
      await promptService.create({
        title: saveData.title.trim(),
        difficulty: saveData.difficulty as 'facil' | 'media' | 'dificil',
        body: generatedPrompt,
        ...(cleanTags.length > 0 && { tags: cleanTags })
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

  // Navigation functions
  const goToNextStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1];
      if (canNavigateToStep(nextStep.id)) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  const goToPrevStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(WIZARD_STEPS[currentIndex - 1].id);
    }
  };

  const goToStep = (step: SimpleStep) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  // Initial mode selection screen
  const renderInitialScreen = () => (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Generador de Prompts</h1>
        <p className="text-muted-foreground">Elige el modo que prefieras para crear tu prompt perfecto</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
          onClick={() => setMode('simple')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              Modo Sencillo
            </CardTitle>
            <CardDescription className="text-base">
              Wizard paso a paso con los 7 pilares fundamentales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Perfecto para:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Crear prompts rápidamente
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Usuarios principiantes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Estructura guiada
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
          onClick={() => setMode('advanced')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              Modo Experto
            </CardTitle>
            <CardDescription className="text-base">
              Bloques reordenables, variables y funciones avanzadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Perfecto para:</p>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Prompts más complejos y potentes
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Control total del resultado
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  Variables y plantillas
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Progress bar component
  const ProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Modo Sencillo</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setMode('initial')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Cambiar modo
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
        {WIZARD_STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const IconComponent = step.icon;
          
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div
                className={`flex flex-col items-center cursor-pointer group ${
                  canNavigateToStep(step.id) ? '' : 'cursor-not-allowed'
                }`}
                onClick={() => goToStep(step.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    status === 'current'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : status === 'completed'
                      ? 'bg-green-500 text-white border-green-500'
                      : status === 'error'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-muted text-muted-foreground border-muted-foreground/30'
                  } ${canNavigateToStep(step.id) ? 'group-hover:scale-110' : ''}`}
                >
                  {status === 'completed' && !step.required ? (
                    <Check className="h-4 w-4" />
                  ) : status === 'completed' && step.required ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <IconComponent className="h-4 w-4" />
                  )}
                </div>
                <span className={`text-xs mt-1 text-center max-w-[60px] leading-tight ${
                  status === 'current' ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  getStepStatus(WIZARD_STEPS[index + 1].id) === 'completed' ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Chip input component
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

  // Step content renderers
  const renderRolStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">¿Quién debe ser el asistente?</label>
        <Select value={simpleData.rol || undefined} onValueChange={(value) => setSimpleData(prev => ({ ...prev, rol: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
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
      </div>
      
      {simpleData.rol === 'Otro' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Describe el rol personalizado</label>
          <Input
            value={simpleData.rolCustom}
            onChange={(e) => setSimpleData(prev => ({ ...prev, rolCustom: e.target.value }))}
            placeholder="Ej: Especialista en marketing digital"
          />
        </div>
      )}
    </div>
  );

  const renderObjetivoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">¿Qué quieres que haga exactamente?</label>
        <Textarea
          value={simpleData.objetivo}
          onChange={(e) => setSimpleData(prev => ({ ...prev, objetivo: e.target.value }))}
          placeholder="Describe el objetivo principal..."
          rows={3}
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Ejemplos rápidos (click para añadir):</p>
        <div className="flex flex-wrap gap-2">
          {['resumir un texto', 'comparar dos opciones', 'explicar un concepto', 'hacer un checklist', 'redactar un correo', 'generar ideas'].map(chip => (
            <Badge
              key={chip}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSimpleData(prev => ({ 
                ...prev, 
                objetivo: prev.objetivo + (prev.objetivo ? ', ' : '') + chip 
              }))}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudienciaStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">¿Para quién es la respuesta?</label>
        <ChipInput
          items={simpleData.audiencia}
          onAdd={(item) => setSimpleData(prev => ({ ...prev, audiencia: addToArray(prev.audiencia, item) }))}
          onRemove={(index) => setSimpleData(prev => ({ ...prev, audiencia: removeFromArray(prev.audiencia, index) }))}
          placeholder="Ej: Directivos, Equipo técnico..."
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Sugerencias:</p>
        <div className="flex flex-wrap gap-2">
          {['Directivos', 'Equipo técnico', 'Clientes', 'Principiantes', 'Público general', 'Reclutadores'].map(chip => (
            <Badge
              key={chip}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSimpleData(prev => ({ 
                ...prev, 
                audiencia: addToArray(prev.audiencia, chip)
              }))}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFormatoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">¿En qué formato quieres la respuesta?</label>
        <Select value={simpleData.formato || undefined} onValueChange={(value) => setSimpleData(prev => ({ ...prev, formato: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Lista">Lista</SelectItem>
            <SelectItem value="Tabla">Tabla</SelectItem>
            <SelectItem value="Párrafos">Párrafos</SelectItem>
            <SelectItem value="Pasos numerados">Pasos numerados</SelectItem>
            <SelectItem value="JSON estructurado">JSON estructurado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {simpleData.formato === 'Tabla' && (
        <div>
          <label className="text-sm font-medium mb-2 block">Columnas de la tabla</label>
          <ChipInput
            items={simpleData.formatoColumnas}
            onAdd={(item) => setSimpleData(prev => ({ ...prev, formatoColumnas: addToArray(prev.formatoColumnas, item) }))}
            onRemove={(index) => setSimpleData(prev => ({ ...prev, formatoColumnas: removeFromArray(prev.formatoColumnas, index) }))}
            placeholder="Ej: Nombre, Descripción, Precio..."
            maxItems={8}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="encabezados"
          checked={simpleData.formatoEncabezados}
          onCheckedChange={(checked) => setSimpleData(prev => ({ ...prev, formatoEncabezados: Boolean(checked) }))}
        />
        <label htmlFor="encabezados" className="text-sm">Incluir titulares/encabezados</label>
      </div>
    </div>
  );

  const renderRestriccionesStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Restricciones y requisitos</label>
        <ChipInput
          items={simpleData.restricciones}
          onAdd={(item) => setSimpleData(prev => ({ ...prev, restricciones: addToArray(prev.restricciones, item) }))}
          onRemove={(index) => setSimpleData(prev => ({ ...prev, restricciones: removeFromArray(prev.restricciones, index) }))}
          placeholder="Ej: máx. 150 palabras, tono formal..."
        />
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground mb-2">Restricciones comunes:</p>
        <div className="flex flex-wrap gap-2">
          {['máx. 150 palabras', 'tono formal', 'sin jerga', 'cita fuentes', 'incluye ejemplos'].map(chip => (
            <Badge
              key={chip}
              variant="outline"
              className="cursor-pointer hover:bg-accent"
              onClick={() => setSimpleData(prev => ({ 
                ...prev, 
                restricciones: addToArray(prev.restricciones, chip)
              }))}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTonoStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Tono de la respuesta</label>
        <Select value={simpleData.tono || undefined} onValueChange={(value) => setSimpleData(prev => ({ ...prev, tono: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tono" />
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
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Voz</label>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="voz-activa"
              name="voz"
              value="activa"
              checked={simpleData.voz === 'activa'}
              onChange={(e) => setSimpleData(prev => ({ ...prev, voz: e.target.value }))}
            />
            <label htmlFor="voz-activa" className="text-sm">Activa</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="voz-pasiva"
              name="voz"
              value="pasiva"
              checked={simpleData.voz === 'pasiva'}
              onChange={(e) => setSimpleData(prev => ({ ...prev, voz: e.target.value }))}
            />
            <label htmlFor="voz-pasiva" className="text-sm">Pasiva</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCriteriosStep = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Criterios de evaluación (arrastra para ordenar por prioridad)</label>
        <div className="space-y-2">
          {['Claridad', 'Precisión', 'Estructura', 'Cobertura', 'Rigor', 'Originalidad'].map(criterio => (
            <div key={criterio} className="flex items-center space-x-2">
              <Checkbox
                id={criterio}
                checked={simpleData.criterios.includes(criterio)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSimpleData(prev => ({ 
                      ...prev, 
                      criterios: [...prev.criterios, criterio]
                    }));
                  } else {
                    setSimpleData(prev => ({ 
                      ...prev, 
                      criterios: prev.criterios.filter(c => c !== criterio)
                    }));
                  }
                }}
              />
              <label htmlFor={criterio} className="text-sm">{criterio}</label>
            </div>
          ))}
        </div>
      </div>
      
      {simpleData.criterios.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Orden de prioridad: {simpleData.criterios.join(' > ')}
          </p>
        </div>
      )}
    </div>
  );

  const renderExtrasStep = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Contexto breve (opcional)</label>
        <Textarea
          value={simpleData.contexto}
          onChange={(e) => setSimpleData(prev => ({ ...prev, contexto: e.target.value }))}
          placeholder="Proporciona contexto adicional si es necesario..."
          rows={2}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {simpleData.contexto.length}/500 caracteres
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Ejemplo único (few-shot) - opcional</label>
        <div className="space-y-3">
          <div>
            <Input
              value={simpleData.ejemploEntrada}
              onChange={(e) => setSimpleData(prev => ({ ...prev, ejemploEntrada: e.target.value }))}
              placeholder="Ejemplo de entrada"
            />
          </div>
          <div>
            <Textarea
              value={simpleData.ejemploSalida}
              onChange={(e) => setSimpleData(prev => ({ ...prev, ejemploSalida: e.target.value }))}
              placeholder="Ejemplo de salida esperada"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Simple mode wizard render
  const renderSimpleMode = () => {
    const currentStepConfig = WIZARD_STEPS.find(s => s.id === currentStep);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
    const isLastStep = currentIndex === WIZARD_STEPS.length - 1;
    const canProceed = !currentStepConfig?.required || isStepValid(currentStep);

    return (
      <div className="max-w-4xl mx-auto p-6">
        <ProgressBar />
        
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Step Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStepConfig && (
                    <>
                      <currentStepConfig.icon className="h-5 w-5" />
                      {currentStepConfig.title}
                      {currentStepConfig.required && (
                        <Badge variant="secondary" className="ml-2">Obligatorio</Badge>
                      )}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStep === 'rol' && renderRolStep()}
                {currentStep === 'objetivo' && renderObjetivoStep()}
                {currentStep === 'audiencia' && renderAudienciaStep()}
                {currentStep === 'formato' && renderFormatoStep()}
                {currentStep === 'restricciones' && renderRestriccionesStep()}
                {currentStep === 'tono' && renderTonoStep()}
                {currentStep === 'criterios' && renderCriteriosStep()}
                {currentStep === 'extras' && renderExtrasStep()}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="text-sm text-muted-foreground">
                Paso {currentIndex + 1} de {WIZARD_STEPS.length}
              </div>

              {isLastStep ? (
                <Button
                  onClick={() => {
                    // Validar pasos obligatorios
                    const requiredSteps = WIZARD_STEPS.filter(s => s.required);
                    const invalidSteps = requiredSteps.filter(s => !isStepValid(s.id));
                    
                    if (invalidSteps.length > 0) {
                      toast({
                        title: "Error",
                        description: `Completa los pasos obligatorios: ${invalidSteps.map(s => s.title).join(', ')}`,
                        variant: "destructive",
                      });
                      return;
                    }
                    
                    toast({
                      title: "¡Prompt completado!",
                      description: "Tu prompt está listo para usar",
                    });
                  }}
                  disabled={!canProceed}
                >
                  Finalizar
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Preview */}
          {renderPreviewPanel()}
        </div>
      </div>
    );
  };

  // Advanced mode components
  const VariablePanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Variables
        </CardTitle>
        <CardDescription>
          Define variables para reutilizar en cualquier bloque
        </CardDescription>
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
            disabled={!validateVariableName(newVariableName) || !newVariableName.trim() || !newVariableValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {Object.entries(advancedData.variables).length > 0 && (
          <div className="space-y-2">
            {Object.entries(advancedData.variables).map(([name, value]) => (
              <div key={name} className="flex items-center gap-2 p-2 border rounded">
                <code className="text-sm font-mono">${name}</code>
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
        
        {Object.keys(advancedData.variables).length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay variables definidas
          </p>
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
            <div className="flex flex-wrap gap-4">
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
          <div className="space-y-4">
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
                  const newContent = block.content + `\${${name}}`;
                  updateBlock(block.id, { content: newContent });
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

  // Advanced mode render
  const renderAdvancedMode = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Modo Experto</h2>
        <Button variant="outline" onClick={() => setMode('initial')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Cambiar modo
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Variables and controls */}
        <div className="space-y-6">
          <VariablePanel />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Añadir Bloques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('system')}
                >
                  System
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('user')}
                >
                  User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('assistant')}
                >
                  Assistant
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('cot')}
                >
                  CoT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('react')}
                >
                  ReAct
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('output')}
                >
                  Output
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('restrictions')}
                >
                  Restrictions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('audience')}
                >
                  Audience
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock('rubric')}
                >
                  Rubric
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle column - Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bloques del Prompt</h3>
            <Badge variant="secondary">
              {advancedData.blocks.filter(b => b.enabled).length} activos
            </Badge>
          </div>
          
          {advancedData.blocks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No hay bloques. Añade algunos usando los botones de la izquierda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {advancedData.blocks
                .sort((a, b) => a.order - b.order)
                .map(block => (
                  <BlockCard key={block.id} block={block} />
                ))}
            </div>
          )}
        </div>

        {/* Right column - Preview */}
        {renderPreviewPanel()}
      </div>
    </div>
  );

  // Preview panel component
  const renderPreviewPanel = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Previsualización
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={promptFormat} onValueChange={(value: PromptFormat) => setPromptFormat(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Texto
                    </div>
                  </SelectItem>
                  <SelectItem value="html">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      HTML-like
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      JSON
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            {characterCount} caracteres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto p-3 bg-muted/50 rounded border">
              {generatedPrompt ? (
                <pre className="text-sm whitespace-pre-wrap font-mono">{generatedPrompt}</pre>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {mode === 'simple' 
                    ? 'Completa los pasos para ver la previsualización...'
                    : 'Añade bloques para ver la previsualización...'
                  }
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={copyPrompt}
                disabled={!generatedPrompt}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={exportPrompt}
                disabled={!generatedPrompt}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              
              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!generatedPrompt}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Guardar Prompt</DialogTitle>
                    <DialogDescription>
                      Guarda tu prompt para reutilizarlo más tarde
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Título *</label>
                      <Input
                        value={saveData.title}
                        onChange={(e) => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Nombre del prompt"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Dificultad</label>
                      <Select value={saveData.difficulty || undefined} onValueChange={(value) => setSaveData(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la dificultad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facil">Fácil</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="dificil">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Etiquetas</label>
                      <ChipInput
                        items={saveData.tags}
                        onAdd={(item) => setSaveData(prev => ({ ...prev, tags: addToArray(prev.tags, item) }))}
                        onRemove={(index) => setSaveData(prev => ({ ...prev, tags: removeFromArray(prev.tags, index) }))}
                        placeholder="Añadir etiqueta"
                        maxItems={5}
                      />
                    </div>
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
              
              <Button
                size="sm"
                variant="outline"
                onClick={resetBuilder}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restablecer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Main render
  if (mode === 'initial') {
    return renderInitialScreen();
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {mode === 'simple' ? renderSimpleMode() : renderAdvancedMode()}
    </div>
  );
};

export default PromptBuilder;
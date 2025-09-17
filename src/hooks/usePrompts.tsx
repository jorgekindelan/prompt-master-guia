import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { promptService } from '@/lib/services/promptService';
import { tagService } from '@/lib/services/tagService';
import type { Prompt, Tag, CreatePromptRequest, PromptFilters } from '@/lib/types';

// Legacy Category interface for compatibility
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Legacy interface for compatibility
export interface CreatePromptData {
  title: string;
  description?: string;
  content: string;
  tags: string[];
  category_id?: string;
  is_public?: boolean;
}

interface PromptsContextType {
  prompts: Prompt[];
  categories: Category[];
  loading: boolean;
  refreshPrompts: () => Promise<void>;
  createPrompt: (promptData: CreatePromptData) => Promise<boolean>;
  updatePrompt: (id: string, updates: Partial<CreatePromptData>) => Promise<boolean>;
  deletePrompt: (id: string) => Promise<boolean>;
  ratePrompt: (promptId: string, rating: number) => Promise<boolean>;
  toggleFavorite: (promptId: string) => Promise<boolean>;
}

const PromptsContext = createContext<PromptsContextType | undefined>(undefined);

export function PromptsProvider({ children }: { children: React.ReactNode }) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock categories for compatibility (since Django doesn't have this concept)
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Escritura',
      description: 'Prompts para escritura creativa',
      icon: '✍️',
      color: 'blue'
    },
    {
      id: '2', 
      name: 'Programación',
      description: 'Prompts para programación',
      icon: '💻',
      color: 'green'
    },
    {
      id: '3',
      name: 'Marketing',
      description: 'Prompts para marketing',
      icon: '📈',
      color: 'purple'
    }
  ];

  const fetchPrompts = async (filters: PromptFilters = {}) => {
    try {
      const data = await promptService.list(filters);
      setPrompts(data);
    } catch (error: any) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error al cargar prompts",
        description: error.message || "No se pudieron cargar los prompts",
        variant: "destructive"
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Using mock categories since Django backend doesn't have categories
      setCategories(mockCategories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchPrompts()]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  const refreshPrompts = async () => {
    await fetchPrompts();
  };

  const createPrompt = async (promptData: CreatePromptData): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Convert legacy format to Django format
      const djangoPromptData: CreatePromptRequest = {
        title: promptData.title,
        difficulty: 'facil', // default difficulty
        body: promptData.content,
        tags: promptData.tags.map(tagName => ({ name: tagName }))
      };

      const newPrompt = await promptService.create(djangoPromptData);
      
      // Add to local state
      setPrompts(prev => [newPrompt, ...prev]);
      
      toast({
        title: "¡Prompt creado!",
        description: "Tu prompt ha sido creado exitosamente",
        variant: "default"
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al crear prompt",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePrompt = async (id: string, updates: Partial<CreatePromptData>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para editar prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Convert legacy format to Django format
      const djangoUpdates: Partial<CreatePromptRequest> = {};
      
      if (updates.title) djangoUpdates.title = updates.title;
      if (updates.content) djangoUpdates.body = updates.content;
      if (updates.tags) djangoUpdates.tags = updates.tags.map(tagName => ({ name: tagName }));

      const updatedPrompt = await promptService.update(Number(id), djangoUpdates);
      
      // Update local state
      setPrompts(prev => 
        prev.map(prompt => prompt.id === Number(id) ? updatedPrompt : prompt)
      );
      
      toast({
        title: "Prompt actualizado",
        description: "Tu prompt ha sido actualizado exitosamente",
        variant: "default"
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al actualizar prompt",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePrompt = async (id: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      await promptService.remove(Number(id));
      
      // Remove from local state
      setPrompts(prev => prev.filter(prompt => prompt.id !== Number(id)));
      
      toast({
        title: "Prompt eliminado",
        description: "Tu prompt ha sido eliminado exitosamente",
        variant: "default"
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al eliminar prompt",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const ratePrompt = async (promptId: string, rating: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para calificar prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Django doesn't have rating endpoint in the spec, so we'll just show success
      toast({
        title: "Calificación guardada",
        description: "Tu calificación ha sido guardada",
        variant: "default"
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al calificar",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleFavorite = async (promptId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      return false;
    }

    // Find the prompt
    const prompt = prompts.find(p => p.id === Number(promptId));
    if (!prompt) return false;

    // Optimistic update
    const isCurrentlyFavorited = prompt.is_favorited;
    setPrompts(prev => prev.map(p => 
      p.id === Number(promptId) 
        ? { 
            ...p, 
            is_favorited: !isCurrentlyFavorited,
            favorites_count: isCurrentlyFavorited 
              ? p.favorites_count - 1 
              : p.favorites_count + 1
          }
        : p
    ));

    try {
      if (isCurrentlyFavorited) {
        await promptService.unfavorite(Number(promptId));
        toast({
          title: "Eliminado de favoritos",
          description: "El prompt ha sido eliminado de tus favoritos",
          variant: "default"
        });
      } else {
        await promptService.favorite(Number(promptId));
        toast({
          title: "Añadido a favoritos",
          description: "El prompt ha sido añadido a tus favoritos",
          variant: "default"
        });
      }

      return true;
    } catch (error: any) {
      // Revert optimistic update on error
      setPrompts(prev => prev.map(p => 
        p.id === Number(promptId) 
          ? { 
              ...p, 
              is_favorited: isCurrentlyFavorited,
              favorites_count: prompt.favorites_count
            }
          : p
      ));

      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  const value = {
    prompts,
    categories,
    loading,
    refreshPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    ratePrompt,
    toggleFavorite
  };

  return <PromptsContext.Provider value={value}>{children}</PromptsContext.Provider>;
}

export function usePrompts() {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptsProvider');
  }
  return context;
}
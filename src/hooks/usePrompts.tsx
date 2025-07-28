import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category_id: string;
  category?: Category;
  user_id: string;
  is_public: boolean;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePromptData {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category_id: string;
  is_public: boolean;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch prompts
  useEffect(() => {
    fetchPrompts();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar categorías",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error: any) {
      toast({
        title: "Error al cargar prompts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (promptData: CreatePromptData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...promptData,
          user_id: user.id
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      setPrompts(prev => [data, ...prev]);
      toast({
        title: "¡Prompt creado!",
        description: "Tu prompt ha sido creado exitosamente",
        variant: "default"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error al crear prompt",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const updatePrompt = async (id: string, updates: Partial<CreatePromptData>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      setPrompts(prev => prev.map(prompt => 
        prompt.id === id ? data : prompt
      ));
      
      toast({
        title: "Prompt actualizado",
        description: "Tu prompt ha sido actualizado exitosamente",
        variant: "default"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error al actualizar prompt",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const deletePrompt = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPrompts(prev => prev.filter(prompt => prompt.id !== id));
      toast({
        title: "Prompt eliminado",
        description: "Tu prompt ha sido eliminado exitosamente",
        variant: "default"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error al eliminar prompt",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const ratePrompt = async (promptId: string, rating: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para calificar prompts",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          prompt_id: promptId,
          rating
        });

      if (error) throw error;

      // Refresh prompts to get updated ratings
      await fetchPrompts();
      
      toast({
        title: "Calificación guardada",
        description: "Tu calificación ha sido guardada",
        variant: "default"
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Error al calificar",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleFavorite = async (promptId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar favoritos",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .single();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('prompt_id', promptId);

        if (error) throw error;
        
        toast({
          title: "Eliminado de favoritos",
          description: "El prompt ha sido eliminado de tus favoritos",
          variant: "default"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            prompt_id: promptId
          });

        if (error) throw error;
        
        toast({
          title: "Añadido a favoritos",
          description: "El prompt ha sido añadido a tus favoritos",
          variant: "default"
        });
      }

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    prompts,
    categories,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    ratePrompt,
    toggleFavorite,
    refreshPrompts: fetchPrompts
  };
}
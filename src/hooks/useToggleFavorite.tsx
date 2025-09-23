import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/services/promptService';
import { useToast } from '@/hooks/use-toast';
import type { Prompt } from '@/lib/types';

// Query keys for different data types - updated to match usePaginatedPrompts
const KEYS = {
  prompts: (type: 'all' | 'mine' | 'favorites', filters?: any) => [
    type === 'all' ? 'prompts-all' : 
    type === 'mine' ? 'prompts-mine' : 'prompts-favorites', 
    filters
  ],
  detail: (id: number) => ['prompt', id],
};

// Helper function to update prompt in paginated or single data structures
function patchListCache(qc: any, key: any, id: number, nextFav: boolean) {
  qc.setQueryData(key, (old: any) => {
    if (!old) return old;
    
    // Handle paginated DRF response {count, next, previous, results}
    if (old.results && Array.isArray(old.results)) {
      const results = old.results.map((p: Prompt) =>
        p.id === id ? { ...p, is_favorited: nextFav } : p
      );
      
      // If it's favorites list and removing favorite, filter it out
      const isFavList = String(key).includes('prompts-favorites');
      const finalResults = isFavList && !nextFav 
        ? results.filter((p: Prompt) => p.id !== id) 
        : results;
      
      return { 
        ...old, 
        results: finalResults,
        count: isFavList && !nextFav ? old.count - 1 : old.count
      };
    }
    
    // Handle single prompt (detail view)
    if (old?.id === id) {
      return { ...old, is_favorited: nextFav };
    }
    
    // Handle array of prompts (non-paginated)
    if (Array.isArray(old)) {
      return old.map((p: Prompt) =>
        p.id === id ? { ...p, is_favorited: nextFav } : p
      );
    }
    
    return old;
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async ({ id, toFav }: { id: number; toFav: boolean }) => {
      if (toFav) {
        await promptService.favorite(id);
      } else {
        await promptService.unfavorite(id);
      }
      return { id, toFav };
    },
    
    onMutate: async ({ id, toFav }) => {
      // Get all potentially cached queries to update
      const allQueries = queryClient.getQueryCache().getAll();
      
      // Apply optimistic updates to all relevant caches
      allQueries.forEach((query) => {
        const queryKey = query.queryKey;
        
        // Update prompts lists (all, mine, favorites)
        if (Array.isArray(queryKey) && 
            (queryKey[0] === 'prompts-all' || 
             queryKey[0] === 'prompts-mine' || 
             queryKey[0] === 'prompts-favorites')) {
          patchListCache(queryClient, queryKey, id, toFav);
        }
        
        // Update single prompt detail
        if (Array.isArray(queryKey) && 
            queryKey[0] === 'prompt' && 
            queryKey[1] === id) {
          patchListCache(queryClient, queryKey, id, toFav);
        }
      });
      
      return { id, toFav };
    },
    
    onError: (err: any, vars, ctx) => {
      if (!ctx) return;
      
      const { id, toFav } = ctx;
      const revertTo = !toFav;
      
      // Revert all optimistic updates by re-applying with reverted state
      const allQueries = queryClient.getQueryCache().getAll();
      
      allQueries.forEach((query) => {
        const queryKey = query.queryKey;
        
        // Revert prompts lists (all, mine, favorites)
        if (Array.isArray(queryKey) && 
            (queryKey[0] === 'prompts-all' || 
             queryKey[0] === 'prompts-mine' || 
             queryKey[0] === 'prompts-favorites')) {
          patchListCache(queryClient, queryKey, id, revertTo);
        }
        
        // Revert single prompt detail
        if (Array.isArray(queryKey) && 
            queryKey[0] === 'prompt' && 
            queryKey[1] === id) {
          patchListCache(queryClient, queryKey, id, revertTo);
        }
      });
      
      // Handle authentication errors
      if (err?.response?.status === 401) {
        toast({
          variant: 'destructive',
          title: 'Inicia sesión para usar favoritos',
          description: 'Serás redirigido a la página principal',
        });
        navigate('/');
        return;
      }
      
      // Show error toast for other errors
      const errorMessage = err?.response?.data?.detail || 
                          err?.response?.data?.message || 
                          err?.message || 
                          'No se pudo actualizar el favorito';
      
      toast({
        variant: 'destructive',
        title: 'Error al actualizar favorito',
        description: errorMessage,
      });
    },
    
    onSettled: (_data, _err, vars, _ctx) => {
      const { id } = vars;
      
      // Invalidate queries for background refetch (soft revalidation)
      queryClient.invalidateQueries({ queryKey: ['prompt', id] });
      
      // Invalidate all prompts lists to ensure consistency
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && 
                 (key[0] === 'prompts-all' || 
                  key[0] === 'prompts-mine' || 
                  key[0] === 'prompts-favorites');
        }
      });
    },
  });

  return mutation;
}
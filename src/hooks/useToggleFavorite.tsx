import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { promptService } from '@/lib/services/promptService';
import { useToast } from '@/hooks/use-toast';
import type { Prompt } from '@/lib/types';

// Query keys for different data types
const KEYS = {
  list: (params?: any) => ['prompts', params],
  myFavs: (page?: number) => ['my-favorites', page],
  myPrompts: (page?: number) => ['my-prompts', page],
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
      const isFavList = String(key).includes('my-favorites');
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
      // Create snapshot for rollback
      const snapshot = {
        lists: [
          ['prompts', { page: 1 }],
          ['prompts', { page: 2 }], // Include a few pages that might be cached
          ['prompts', { page: 3 }],
        ],
        myFavsKeys: [['my-favorites', 1], ['my-favorites', 2], ['my-favorites', 3]],
        myPromptsKeys: [['my-prompts', 1], ['my-prompts', 2], ['my-prompts', 3]],
        detailKey: ['prompt', id],
      };
      
      // Apply optimistic updates to all relevant caches
      const allKeys = [
        ...snapshot.lists,
        ...snapshot.myFavsKeys,
        ...snapshot.myPromptsKeys,
        snapshot.detailKey,
      ];
      
      allKeys.forEach((key) => {
        patchListCache(queryClient, key, id, toFav);
      });
      
      return { snapshot, id, toFav };
    },
    
    onError: (err: any, vars, ctx) => {
      if (!ctx) return;
      
      const { id, toFav } = ctx;
      const revertTo = !toFav;
      
      // Revert all optimistic updates
      const allKeys = [
        ...ctx.snapshot.lists,
        ...ctx.snapshot.myFavsKeys,
        ...ctx.snapshot.myPromptsKeys,
        ctx.snapshot.detailKey,
      ];
      
      allKeys.forEach((key) => {
        patchListCache(queryClient, key, id, revertTo);
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
      
      // Optionally invalidate list queries if you want fresh data
      // This is usually not necessary with good optimistic updates
      // queryClient.invalidateQueries({ queryKey: ['prompts'] });
      // queryClient.invalidateQueries({ queryKey: ['my-favorites'] });
      // queryClient.invalidateQueries({ queryKey: ['my-prompts'] });
    },
  });

  return mutation;
}
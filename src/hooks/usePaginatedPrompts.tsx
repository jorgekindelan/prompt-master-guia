import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useToast } from './use-toast';
import { promptService } from '@/lib/services/promptService';
import type { Prompt, PromptFilters } from '@/lib/types';

interface PaginatedData {
  count: number;
  next: string | null;
  previous: string | null;
  results: Prompt[];
}

interface UsePaginatedPromptsReturn {
  prompts: Prompt[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  setPage: (page: number) => void;
  refresh: () => void;
  retry: () => void;
}

export function usePaginatedPrompts(
  type: 'all' | 'mine' | 'favorites',
  filters: PromptFilters = {}
): UsePaginatedPromptsReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Generate query key based on type and filters
  const queryKey = [
    type === 'all' ? 'prompts-all' : 
    type === 'mine' ? 'prompts-mine' : 'prompts-favorites',
    { page: currentPage, ...filters }
  ];

  const {
    data,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      let response: PaginatedData;
      
      switch (type) {
        case 'mine':
          response = await promptService.mine(currentPage);
          break;
        case 'favorites':
          response = await promptService.myFavorites(currentPage);
          break;
        default:
          response = await promptService.listAll(currentPage, filters);
          break;
      }
      
      return response;
    },
    placeholderData: (previousData) => previousData,
  });

  const defaultData = { count: 0, next: null, previous: null, results: [] };
  const safeData = data || defaultData;
  
  const totalPages = Math.ceil(safeData.count / 6);
  const error = queryError ? (queryError as any).response?.data?.detail || (queryError as any).message || 'Error al cargar los prompts' : null;

  const setPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  const refresh = () => {
    refetch();
  };

  const retry = () => {
    refetch();
  };

  return {
    prompts: safeData.results ?? [],
    loading: isLoading,
    error,
    currentPage,
    totalPages,
    totalCount: safeData.count,
    hasNext: !!safeData.next,
    hasPrevious: !!safeData.previous,
    setPage,
    refresh,
    retry
  };
}
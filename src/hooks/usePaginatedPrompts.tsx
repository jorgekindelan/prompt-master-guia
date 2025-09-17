import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [data, setData] = useState<PaginatedData>({
    count: 0,
    next: null,
    previous: null,
    results: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(data.count / 6);

  const fetchData = async (page: number = currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      let response: PaginatedData;
      
      switch (type) {
        case 'mine':
          response = await promptService.mine(page);
          break;
        case 'favorites':
          response = await promptService.myFavorites(page);
          break;
        default:
          response = await promptService.listAll(page, filters);
          break;
      }
      
      setData(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error al cargar los prompts';
      setError(errorMessage);
      setData({ count: 0, next: null, previous: null, results: [] });
      
      // Only show toast for non-401 errors to avoid spam during auth issues
      if (err.response?.status !== 401) {
        toast({
          title: "Error al cargar prompts",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const setPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  const refresh = () => {
    fetchData(currentPage);
  };

  const retry = () => {
    fetchData(currentPage);
  };

  // Handle page deletion scenario
  const handleEmptyPageRedirect = () => {
    if (data.results.length === 0 && currentPage > 1 && totalPages > 0) {
      setPage(Math.min(currentPage - 1, totalPages));
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, type, filters.search, filters.difficulty, filters.tag]);

  useEffect(() => {
    handleEmptyPageRedirect();
  }, [data.results.length, currentPage, totalPages]);

  return {
    prompts: data.results ?? [],
    loading,
    error,
    currentPage,
    totalPages,
    totalCount: data.count,
    hasNext: !!data.next,
    hasPrevious: !!data.previous,
    setPage,
    refresh,
    retry
  };
}
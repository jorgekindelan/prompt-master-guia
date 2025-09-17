import apiClient from '../api/client';
import type { Prompt, CreatePromptRequest, PromptFilters } from '../types';

class PromptService {
  async list(filters: PromptFilters = {}, page = 1): Promise<{ count: number; next: string | null; previous: string | null; results: Prompt[] }> {
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.owner) params.append('owner', filters.owner);

    const response = await apiClient.get(`/prompts/?${params.toString()}`);
    return {
      count: response.data?.count ?? 0,
      next: response.data?.next ?? null,
      previous: response.data?.previous ?? null,
      results: Array.isArray(response.data?.results) ? response.data.results : []
    };
  }

  async listAll(page = 1, params: any = {}): Promise<{ count: number; next: string | null; previous: string | null; results: Prompt[] }> {
    const { data } = await apiClient.get('/prompts/', { params: { page, ...params } });
    return {
      count: data?.count ?? 0,
      next: data?.next ?? null,
      previous: data?.previous ?? null,
      results: Array.isArray(data?.results) ? data.results : [],
    };
  }

  async detail(id: number): Promise<Prompt> {
    const response = await apiClient.get<Prompt>(`/prompts/${id}/`);
    return response.data;
  }

  async create(data: CreatePromptRequest): Promise<Prompt> {
    const response = await apiClient.post<Prompt>('/prompts/', data);
    return response.data;
  }

  async update(id: number, data: Partial<CreatePromptRequest>): Promise<Prompt> {
    const response = await apiClient.patch<Prompt>(`/prompts/${id}/`, data);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/prompts/${id}/`);
  }

  async favorite(id: number): Promise<void> {
    await apiClient.post(`/prompts/${id}/favorite/`);
  }

  async unfavorite(id: number): Promise<void> {
    await apiClient.delete(`/prompts/${id}/unfavorite/`);
  }

  async mine(page = 1): Promise<{ count: number; next: string | null; previous: string | null; results: Prompt[] }> {
    const response = await apiClient.get('/me/prompts/', { params: { page } });
    return {
      count: response.data?.count ?? 0,
      next: response.data?.next ?? null,
      previous: response.data?.previous ?? null,
      results: Array.isArray(response.data?.results) ? response.data.results : []
    };
  }

  async myFavorites(page = 1): Promise<{ count: number; next: string | null; previous: string | null; results: Prompt[] }> {
    const response = await apiClient.get('/me/favorites/', { params: { page } });
    return {
      count: response.data?.count ?? 0,
      next: response.data?.next ?? null,
      previous: response.data?.previous ?? null,
      results: Array.isArray(response.data?.results) ? response.data.results : []
    };
  }
}

export const promptService = new PromptService();
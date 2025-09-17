import apiClient from '../api/client';
import type { Prompt, CreatePromptRequest, PromptFilters } from '../types';

class PromptService {
  async list(filters: PromptFilters = {}): Promise<Prompt[]> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.tag) params.append('tag', filters.tag);
    if (filters.owner) params.append('owner', filters.owner);

    const response = await apiClient.get(`/prompts/?${params.toString()}`);
    // Normalize response - handle both direct array and paginated results
    return Array.isArray(response.data) ? response.data : (response.data?.results ?? []);
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

  async mine(): Promise<Prompt[]> {
    const response = await apiClient.get('/me/prompts/');
    return Array.isArray(response.data) ? response.data : (response.data?.results ?? []);
  }

  async myFavorites(): Promise<Prompt[]> {
    const response = await apiClient.get('/me/favorites/');
    return Array.isArray(response.data) ? response.data : (response.data?.results ?? []);
  }
}

export const promptService = new PromptService();
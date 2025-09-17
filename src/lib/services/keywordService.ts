import apiClient from '../api/client';
import type { Keyword } from '../types';

class KeywordService {
  async list(): Promise<Keyword[]> {
    const response = await apiClient.get<Keyword[]>('/keywords/');
    return response.data;
  }

  async create(data: Omit<Keyword, 'id'>): Promise<Keyword> {
    const response = await apiClient.post<Keyword>('/keywords/', data);
    return response.data;
  }

  async update(id: number, data: Partial<Omit<Keyword, 'id'>>): Promise<Keyword> {
    const response = await apiClient.patch<Keyword>(`/keywords/${id}/`, data);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/keywords/${id}/`);
  }
}

export const keywordService = new KeywordService();
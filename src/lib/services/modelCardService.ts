import apiClient from '../api/client';
import type { ModelCard } from '../types';

class ModelCardService {
  async list(): Promise<ModelCard[]> {
    const response = await apiClient.get<ModelCard[]>('/model-cards/');
    return response.data;
  }

  async create(data: Omit<ModelCard, 'id'>): Promise<ModelCard> {
    const response = await apiClient.post<ModelCard>('/model-cards/', data);
    return response.data;
  }

  async update(id: number, data: Partial<Omit<ModelCard, 'id'>>): Promise<ModelCard> {
    const response = await apiClient.patch<ModelCard>(`/model-cards/${id}/`, data);
    return response.data;
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/model-cards/${id}/`);
  }
}

export const modelCardService = new ModelCardService();
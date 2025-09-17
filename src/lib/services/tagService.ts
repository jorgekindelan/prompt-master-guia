import apiClient from '../api/client';
import type { Tag } from '../types';

class TagService {
  async list(): Promise<Tag[]> {
    const response = await apiClient.get<Tag[]>('/tags/');
    return response.data;
  }

  async create(data: { name: string }): Promise<Tag> {
    const response = await apiClient.post<Tag>('/tags/', data);
    return response.data;
  }
}

export const tagService = new TagService();
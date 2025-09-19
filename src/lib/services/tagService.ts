import apiClient from '../api/client';
import type { Tag } from '../types';

class TagService {
  async list(params: { search?: string } = {}): Promise<Tag[]> {
    const searchParams = new URLSearchParams();
    if (params.search) {
      searchParams.append('search', params.search);
    }
    const url = `/tags/${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    const response = await apiClient.get<Tag[]>(url);
    return response.data;
  }

  async create(data: { name: string }): Promise<Tag> {
    const response = await apiClient.post<Tag>('/tags/', data);
    return response.data;
  }
}

export const tagService = new TagService();
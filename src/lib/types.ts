// API Types for Django Backend
export interface User {
  id: number;
  name: string;
  email: string;
  date_joined: string;
  is_staff?: boolean;
  // Compatibility fields for existing components
  user_metadata?: {
    display_name?: string;
  };
}

export interface Tag {
  id?: number;
  name: string;
}

export interface Prompt {
  id: number;
  title: string;
  difficulty: 'facil' | 'media' | 'dificil';
  body: string;
  tags: Tag[];
  owner: User;
  created_at: string;
  updated_at: string;
  favorites_count: number;
  is_favorited?: boolean;
  rating_avg?: number;
  rating_count?: number;
  view_count?: number;
  description?: string;
}

export interface ModelCard {
  id: number;
  name: string;
  description: string;
  link: string;
}

export interface Keyword {
  id: number;
  name: string;
  description: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreatePromptRequest {
  title: string;
  difficulty: 'facil' | 'media' | 'dificil';
  body: string;
  tags: { name: string }[];
}

export interface PromptFilters {
  search?: string;
  difficulty?: string;
  tag?: string;
  owner?: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}
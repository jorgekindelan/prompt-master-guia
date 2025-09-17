import apiClient, { tokenManager } from '../api/client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/', {
      email,
      password,
    });

    const { access, refresh } = response.data;
    tokenManager.setTokens(access, refresh);

    return response.data;
  }

  async register(data: RegisterRequest): Promise<void> {
    await apiClient.post('/auth/register/', data);
  }

  async me(): Promise<User> {
    const response = await apiClient.get<User>('/users/me/');
    return response.data;
  }

  logout(): void {
    tokenManager.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }
}

export const authService = new AuthService();
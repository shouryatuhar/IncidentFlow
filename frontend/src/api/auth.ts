import { apiClient } from './client';
import { User, Role } from '../types';

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (data: RegisterParams) => apiClient.post<AuthResponse>('/auth/register', data),
  login: (data: LoginParams) => apiClient.post<AuthResponse>('/auth/login', data),
  getMe: () => apiClient.get<User>('/auth/me'),
};

export const usersApi = {
  list: () => apiClient.get<User[]>('/users'),
};

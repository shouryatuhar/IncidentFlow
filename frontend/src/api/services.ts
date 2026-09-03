import { apiClient } from './client';
import { Service, ServiceStatus } from '../types';

export interface CreateServiceParams {
  name: string;
  description: string;
  status?: ServiceStatus;
  ownerId?: string;
}

export interface UpdateServiceParams {
  name?: string;
  description?: string;
  status?: ServiceStatus;
  ownerId?: string;
}

export const servicesApi = {
  list: () => apiClient.get<Service[]>('/services'),
  getById: (id: string) => apiClient.get<Service>(`/services/${id}`),
  create: (data: CreateServiceParams) => apiClient.post<Service>('/services', data),
  update: (id: string, data: UpdateServiceParams) => apiClient.patch<Service>(`/services/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/services/${id}`),
};

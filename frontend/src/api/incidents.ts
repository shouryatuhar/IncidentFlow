import { apiClient } from './client';
import {
  Incident,
  IncidentComment,
  TimelineEvent,
  Severity,
  IncidentStatus,
  Pagination,
} from '../types';

export interface QueryIncidentsParams {
  search?: string;
  severity?: Severity;
  status?: IncidentStatus;
  serviceId?: string;
  sortBy?: 'createdAt' | 'severity' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IncidentsListResponse {
  incidents: Incident[];
  pagination: Pagination;
}

export interface CreateIncidentParams {
  title: string;
  description: string;
  severity: Severity;
  serviceId: string;
  assigneeId?: string | null;
}

export interface UpdateIncidentParams {
  title?: string;
  description?: string;
  severity?: Severity;
  status?: IncidentStatus;
  serviceId?: string;
  assigneeId?: string | null;
}

export const incidentsApi = {
  list: (params: QueryIncidentsParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.severity) query.append('severity', params.severity);
    if (params.status) query.append('status', params.status);
    if (params.serviceId) query.append('serviceId', params.serviceId);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const qs = query.toString();
    return apiClient.get<IncidentsListResponse>(`/incidents${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiClient.get<Incident>(`/incidents/${id}`),
  create: (data: CreateIncidentParams) => apiClient.post<Incident>('/incidents', data),
  update: (id: string, data: UpdateIncidentParams) => apiClient.patch<Incident>(`/incidents/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/incidents/${id}`),

  getComments: (id: string) => apiClient.get<IncidentComment[]>(`/incidents/${id}/comments`),
  addComment: (id: string, content: string) =>
    apiClient.post<IncidentComment>(`/incidents/${id}/comments`, { content }),

  getTimeline: (id: string) => apiClient.get<TimelineEvent[]>(`/incidents/${id}/timeline`),
};

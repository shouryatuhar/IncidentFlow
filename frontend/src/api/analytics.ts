import { apiClient } from './client';
import { AnalyticsOverview, IncidentAnalytics } from '../types';

export const analyticsApi = {
  getOverview: () => apiClient.get<AnalyticsOverview>('/analytics/overview'),
  getIncidents: () => apiClient.get<IncidentAnalytics>('/analytics/incidents'),
};

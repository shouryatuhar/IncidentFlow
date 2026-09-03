export type Role = 'ADMIN' | 'ENGINEER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN';

export interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  ownerId: string;
  owner?: User;
  totalIncidents?: number;
  activeIncidentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type Severity = 'SEV_1' | 'SEV_2' | 'SEV_3' | 'SEV_4';

export type IncidentStatus = 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';

export interface IncidentComment {
  id: string;
  incidentId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  actorId?: string | null;
  actor?: User | null;
  type: string;
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  serviceId: string;
  service: Service;
  reporterId: string;
  reporter: User;
  assigneeId?: string | null;
  assignee?: User | null;
  startedAt: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    comments: number;
    timeline: number;
  };
  comments?: IncidentComment[];
  timeline?: TimelineEvent[];
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AnalyticsOverview {
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  servicesAffected: number;
  totalServices: number;
  averageResolutionMinutes: number;
}

export interface IncidentAnalytics {
  bySeverity: Record<Severity, number>;
  byStatus: Record<IncidentStatus, number>;
  byService: Array<{
    serviceId: string;
    serviceName: string;
    totalIncidents: number;
    activeIncidents: number;
  }>;
  volumeOverTime: Array<{
    date: string;
    count: number;
  }>;
}

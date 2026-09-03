import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilterBar } from '../components/incidents/IncidentFilterBar';
import { Incident, Service } from '../types';

describe('Incident Components', () => {
  const mockIncidents: Incident[] = [
    {
      id: 'inc-1234',
      title: 'Payment Gateway Timeout',
      description: 'Stripe webhook latency exceeding 2000ms',
      severity: 'SEV_1',
      status: 'INVESTIGATING',
      serviceId: 'svc-1',
      service: {
        id: 'svc-1',
        name: 'Payment API',
        description: 'Payment service',
        status: 'DEGRADED',
        ownerId: 'u-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      reporterId: 'u-1',
      reporter: { id: 'u-1', name: 'Alex Admin', email: 'admin@incidentflow.dev', role: 'ADMIN' },
      assigneeId: 'u-2',
      assignee: { id: 'u-2', name: 'Elena Engineer', email: 'engineer@incidentflow.dev', role: 'ENGINEER' },
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _count: { comments: 2, timeline: 3 },
    },
  ];

  const mockServices: Service[] = [
    {
      id: 'svc-1',
      name: 'Payment API',
      description: 'Payment service',
      status: 'DEGRADED',
      ownerId: 'u-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders incident row with severity, status, and title', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <IncidentTable incidents={mockIncidents} isLoading={false} />
      </BrowserRouter>
    );

    expect(screen.getByText('Payment Gateway Timeout')).toBeInTheDocument();
    expect(screen.getByText(/SEV-1 Critical/i)).toBeInTheDocument();
    expect(screen.getByText('Investigating')).toBeInTheDocument();
    expect(screen.getByText('Payment API')).toBeInTheDocument();
    expect(screen.getByText('Elena Engineer')).toBeInTheDocument();
  });

  it('renders empty state when no incidents match', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <IncidentTable incidents={[]} isLoading={false} />
      </BrowserRouter>
    );

    expect(screen.getByText(/No incidents found/i)).toBeInTheDocument();
  });

  it('renders filter bar with search input and dropdowns', () => {
    render(
      <IncidentFilterBar
        search=""
        onSearchChange={() => {}}
        onSeverityChange={() => {}}
        onStatusChange={() => {}}
        onServiceIdChange={() => {}}
        services={mockServices}
        onReset={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/Search incidents by title or description/i)).toBeInTheDocument();
    expect(screen.getByText('All Severities')).toBeInTheDocument();
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('All Services')).toBeInTheDocument();
  });
});

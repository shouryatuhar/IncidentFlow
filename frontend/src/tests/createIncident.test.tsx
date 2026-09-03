import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateIncidentModal } from '../components/incidents/CreateIncidentModal';
import { ToastProvider } from '../context/ToastContext';

describe('CreateIncidentModal Component', () => {
  it('renders modal inputs when open', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CreateIncidentModal isOpen={true} onClose={vi.fn()} />
        </ToastProvider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Declare Production Incident/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Auth API 504 gateway timeout/i)).toBeInTheDocument();
    expect(screen.getByText(/Severity Level/i)).toBeInTheDocument();
    expect(screen.getByText(/Affected Service/i)).toBeInTheDocument();
  });

  it('updates title and description state on input', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <CreateIncidentModal isOpen={true} onClose={vi.fn()} />
        </ToastProvider>
      </QueryClientProvider>
    );

    const titleInput = screen.getByPlaceholderText(/Auth API 504 gateway timeout/i) as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Database failover alert' } });
    expect(titleInput.value).toBe('Database failover alert');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

describe('LoginPage Flow', () => {
  it('renders login form and demo fill buttons', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/DevOps incident management platform/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/engineer@incidentflow.dev/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Demo/i)).toBeInTheDocument();
    expect(screen.getByText(/Engineer Demo/i)).toBeInTheDocument();
  });

  it('populates fields when Admin Demo button is clicked', () => {
    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    const adminDemoBtn = screen.getByText(/Admin Demo/i);
    fireEvent.click(adminDemoBtn);

    const emailInput = screen.getByPlaceholderText(/engineer@incidentflow.dev/i) as HTMLInputElement;
    expect(emailInput.value).toBe('admin@incidentflow.dev');
  });

  it('handles login submission', async () => {
    // Mock global fetch for auth/login
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                user: { id: '1', name: 'Elena Engineer', email: 'engineer@incidentflow.dev', role: 'ENGINEER' },
                token: 'mock-jwt-token',
              },
            }),
        });
      }
      return Promise.reject(new Error('not handled'));
    });

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/engineer@incidentflow.dev/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to IncidentFlow/i });

    fireEvent.change(emailInput, { target: { value: 'engineer@incidentflow.dev' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});

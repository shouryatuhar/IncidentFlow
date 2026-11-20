import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { RegisterPage } from '../pages/RegisterPage';

describe('RegisterPage', () => {
  it('does not offer client-selectable platform roles', () => {
    localStorage.clear();

    render(
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    expect(screen.queryByText('Platform Role')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Admin$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete Registration/i })).toBeInTheDocument();
  });
});

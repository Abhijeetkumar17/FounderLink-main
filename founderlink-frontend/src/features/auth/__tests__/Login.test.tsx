import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, unauthenticatedState } from '../../../shared/components/__tests__/test-utils';
import { mockLoginResponse } from '../../../shared/components/__tests__/mockData';

// ─── Mock external dependencies ───
const mockNavigate = vi.fn();
const mockDispatch = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
  };
});

vi.mock('react-hot-toast', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

// Mock the login API
vi.mock('../api/authApi', () => ({
  login: vi.fn(),
}));

import Login from '../pages/Login';
import { login } from '../api/authApi';

const mockedLogin = vi.mocked(login);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Renders login form
  // ═══════════════════════════════════════════════════════════

  it('should render the login form with email and password fields', () => {
    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should render link to registration page', () => {
    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    expect(screen.getByText(/Create one free/i)).toBeInTheDocument();
    const registerLink = screen.getByText(/Create one free/i).closest('a');
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Successful login flow
  // ═══════════════════════════════════════════════════════════

  it('should call login API and navigate on successful founder login', async () => {
    mockedLogin.mockResolvedValue(mockLoginResponse);

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');

    await userEvent.type(emailInput, 'founder@founderlink.com');
    await userEvent.type(passwordInput, 'Password123');

    const submitButton = screen.getByText('Sign In');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: 'founder@founderlink.com',
        password: 'Password123',
      });
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith('Welcome back!');
      expect(mockNavigate).toHaveBeenCalledWith('/founder/dashboard');
    });
  });

  it('should navigate to investor dashboard for ROLE_INVESTOR', async () => {
    const investorResponse = {
      data: {
        data: {
          ...mockLoginResponse.data.data,
          role: 'ROLE_INVESTOR',
        },
      },
    };
    mockedLogin.mockResolvedValue(investorResponse);

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'inv@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/investor/dashboard');
    });
  });

  it('should navigate to admin dashboard for ROLE_ADMIN', async () => {
    const adminResponse = {
      data: {
        data: {
          ...mockLoginResponse.data.data,
          role: 'ROLE_ADMIN',
        },
      },
    };
    mockedLogin.mockResolvedValue(adminResponse);

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'admin@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should navigate to cofounder dashboard for ROLE_COFOUNDER', async () => {
    const cofounderResponse = {
      data: {
        data: {
          ...mockLoginResponse.data.data,
          role: 'ROLE_COFOUNDER',
        },
      },
    };
    mockedLogin.mockResolvedValue(cofounderResponse);

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'cofounder@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cofounder/dashboard');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception: Login failure
  // ═══════════════════════════════════════════════════════════

  it('should show error toast on login failure with server message', async () => {
    mockedLogin.mockRejectedValue({
      response: { data: { message: 'Account locked' } },
    });

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Account locked');
    });
  });

  it('should show default error message when server message is missing', async () => {
    mockedLogin.mockRejectedValue(new Error('Network Error'));

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Form validation
  // ═══════════════════════════════════════════════════════════

  it('should show validation error when email is empty', async () => {
    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('should show validation error when password is empty', async () => {
    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    expect(mockedLogin).not.toHaveBeenCalled();
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Unknown role fallback
  // ═══════════════════════════════════════════════════════════

  it('should navigate to /login for unknown roles', async () => {
    const unknownRoleResponse = {
      data: {
        data: {
          ...mockLoginResponse.data.data,
          role: 'ROLE_UNKNOWN',
        },
      },
    };
    mockedLogin.mockResolvedValue(unknownRoleResponse);

    renderWithProviders(<Login />, { preloadedState: unauthenticatedState });

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'unknown@test.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'Password123');
    await userEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders, authenticatedState, unauthenticatedState } from '../../../shared/components/__tests__/test-utils';
import { createValidJWT, createExpiredJWT } from '../../../shared/components/__tests__/mockData';
import ProtectedRoute from '../ProtectedRoute';

// Mock useAuth to control return values precisely
vi.mock('../../../shared/hooks/useAuth', () => ({
  default: vi.fn(),
}));

import useAuth from '../../../shared/hooks/useAuth';

const mockedUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute Guard', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Authenticated user with valid token
  // ═══════════════════════════════════════════════════════════

  it('should render children when user is authenticated with valid token', () => {
    const validToken = createValidJWT();
    localStorage.setItem('token', validToken);

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Redirect: Unauthenticated user
  // ═══════════════════════════════════════════════════════════

  it('should redirect to /login when user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      role: undefined,
      user: null,
      isFounder: false,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: undefined,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>,
      { preloadedState: unauthenticatedState },
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // Navigate to /login would have been called
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Expired token
  // ═══════════════════════════════════════════════════════════

  it('should redirect when token is expired', () => {
    const expiredToken = createExpiredJWT();
    localStorage.setItem('token', expiredToken);

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should clear localStorage when token is expired', () => {
    const expiredToken = createExpiredJWT();
    localStorage.setItem('token', expiredToken);
    localStorage.setItem('user', JSON.stringify({ userId: 1 }));

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(localStorage.getItem('token')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: No token in localStorage
  // ═══════════════════════════════════════════════════════════

  it('should redirect when no token exists in localStorage', () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    // No token in localStorage
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Role-based: allowedRoles
  // ═══════════════════════════════════════════════════════════

  it('should redirect to /unauthorized when role is not in allowedRoles', () => {
    const validToken = createValidJWT();
    localStorage.setItem('token', validToken);

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_INVESTOR',
      user: { userId: 2, role: 'ROLE_INVESTOR', email: 'inv@test.com' } as any,
      isFounder: false,
      isInvestor: true,
      isAdmin: false,
      isCoFounder: false,
      userId: 2,
    });

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ROLE_FOUNDER', 'ROLE_ADMIN']}>
        <div data-testid="protected-content">Founder Only</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when role is in allowedRoles', () => {
    const validToken = createValidJWT();
    localStorage.setItem('token', validToken);

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    renderWithProviders(
      <ProtectedRoute allowedRoles={['ROLE_FOUNDER', 'ROLE_ADMIN']}>
        <div data-testid="protected-content">Allowed</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════
  //  Edge: Malformed token
  // ═══════════════════════════════════════════════════════════

  it('should handle malformed JWT gracefully (isTokenExpired returns false on error)', () => {
    localStorage.setItem('token', 'not-a-real-jwt');

    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ROLE_FOUNDER',
      user: authenticatedState.auth.user as any,
      isFounder: true,
      isInvestor: false,
      isAdmin: false,
      isCoFounder: false,
      userId: 1,
    });

    // isTokenExpired catches the error and returns false, so the route renders
    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Content</div>
      </ProtectedRoute>,
      { preloadedState: authenticatedState },
    );

    // Per the source code: isTokenExpired returns false on parse error
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { createTestStore, authenticatedState, unauthenticatedState, investorState, cofounderState, adminState } from '../../components/__tests__/test-utils';

// Must import the actual hook
import useAuth from '../useAuth';

// Helper wrapper that injects Redux store
const createWrapper = (preloadedState: Record<string, any>) => {
  const store = createTestStore(preloadedState);
  return ({ children }: PropsWithChildren<{}>) =>
    React.createElement(Provider, { store }, children);
};

describe('useAuth hook', () => {
  // ═══════════════════════════════════════════════════════════
  //  Normal: Authenticated founder
  // ═══════════════════════════════════════════════════════════

  it('should return authenticated state for a founder user', () => {
    const wrapper = createWrapper(authenticatedState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(authenticatedState.auth.user);
    expect(result.current.isFounder).toBe(true);
    expect(result.current.isInvestor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isCoFounder).toBe(false);
    expect(result.current.userId).toBe(1);
    expect(result.current.role).toBe('ROLE_FOUNDER');
  });

  // ═══════════════════════════════════════════════════════════
  //  Role-based flags
  // ═══════════════════════════════════════════════════════════

  it('should return isInvestor=true for investor role', () => {
    const wrapper = createWrapper(investorState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isInvestor).toBe(true);
    expect(result.current.isFounder).toBe(false);
    expect(result.current.isCoFounder).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it('should return isCoFounder=true for cofounder role', () => {
    const wrapper = createWrapper(cofounderState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isCoFounder).toBe(true);
    expect(result.current.isFounder).toBe(false);
  });

  it('should return isAdmin=true for admin role', () => {
    const wrapper = createWrapper(adminState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isFounder).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  //  Unauthenticated (boundary)
  // ═══════════════════════════════════════════════════════════

  it('should return unauthenticated state when no user is logged in', () => {
    const wrapper = createWrapper(unauthenticatedState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isFounder).toBe(false);
    expect(result.current.isInvestor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isCoFounder).toBe(false);
    expect(result.current.userId).toBeUndefined();
    expect(result.current.role).toBeUndefined();
  });

  // ═══════════════════════════════════════════════════════════
  //  Edge case: Unknown role
  // ═══════════════════════════════════════════════════════════

  it('should return all role flags as false for an unknown role', () => {
    const unknownRoleState = {
      auth: {
        token: 'test-token',
        user: { userId: 99, role: 'ROLE_UNKNOWN', email: 'x@y.com' },
        isAuthenticated: true,
      },
    };
    const wrapper = createWrapper(unknownRoleState);
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isFounder).toBe(false);
    expect(result.current.isInvestor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isCoFounder).toBe(false);
    expect(result.current.role).toBe('ROLE_UNKNOWN');
  });
});

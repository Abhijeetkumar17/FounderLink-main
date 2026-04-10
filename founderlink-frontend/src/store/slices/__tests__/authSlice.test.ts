import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { setCredentials, logout, selectCurrentUser, selectIsAuthenticated } from '../authSlice';

const createStore = (preloadedState?: Record<string, any>) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

describe('authSlice (Redux)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ═══════════════════════════════════════════════════════════
  //  Initial state
  // ═══════════════════════════════════════════════════════════

  it('should initialize with unauthenticated state when no token exists', () => {
    const store = createStore();
    const state = store.getState();

    expect(state.auth.token).toBeNull();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  //  setCredentials
  // ═══════════════════════════════════════════════════════════

  it('should set auth state on setCredentials', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 'my-token',
      refreshToken: 'my-refresh',
      userId: '42',
      role: 'ROLE_FOUNDER',
      email: 'test@test.com',
      name: 'Jane',
    }));

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.token).toBe('my-token');
    expect(state.auth.user).toEqual({
      userId: 42, // normalized to Number
      role: 'ROLE_FOUNDER',
      email: 'test@test.com',
      name: 'Jane',
    });
  });

  it('should normalize userId to number', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 't',
      userId: '999',
      role: 'ROLE_INVESTOR',
      email: 'inv@test.com',
    }));

    expect(store.getState().auth.user?.userId).toBe(999);
    expect(typeof store.getState().auth.user?.userId).toBe('number');
  });

  it('should store tokens in localStorage via TokenService', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 'access-123',
      refreshToken: 'refresh-456',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
    }));

    expect(localStorage.getItem('token')).toBe('access-123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
    expect(localStorage.getItem('user')).toBeTruthy();
  });

  it('should handle setCredentials without refreshToken', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 'access-only',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
    }));

    expect(localStorage.getItem('token')).toBe('access-only');
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  //  logout
  // ═══════════════════════════════════════════════════════════

  it('should clear auth state on logout', () => {
    const store = createStore();

    // Login first
    store.dispatch(setCredentials({
      token: 'to-logout',
      refreshToken: 'ref',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
    }));

    expect(store.getState().auth.isAuthenticated).toBe(true);

    // Now logout
    store.dispatch(logout());

    const state = store.getState();
    expect(state.auth.token).toBeNull();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('should clear localStorage on logout', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 'tkn',
      refreshToken: 'ref',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
    }));

    store.dispatch(logout());

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════
  //  Selectors
  // ═══════════════════════════════════════════════════════════

  it('selectCurrentUser should return user from state', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 't',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
      name: 'Jane',
    }));

    expect(selectCurrentUser(store.getState())).toEqual({
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
      name: 'Jane',
    });
  });

  it('selectIsAuthenticated should return authentication status', () => {
    const store = createStore();

    expect(selectIsAuthenticated(store.getState())).toBe(false);

    store.dispatch(setCredentials({
      token: 't',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'a@b.com',
    }));

    expect(selectIsAuthenticated(store.getState())).toBe(true);
  });

  // ═══════════════════════════════════════════════════════════
  //  Edge: Multiple logins
  // ═══════════════════════════════════════════════════════════

  it('should overwrite credentials on subsequent setCredentials calls', () => {
    const store = createStore();

    store.dispatch(setCredentials({
      token: 'first',
      userId: 1,
      role: 'ROLE_FOUNDER',
      email: 'first@test.com',
    }));

    store.dispatch(setCredentials({
      token: 'second',
      userId: 2,
      role: 'ROLE_INVESTOR',
      email: 'second@test.com',
    }));

    const state = store.getState();
    expect(state.auth.token).toBe('second');
    expect(state.auth.user?.userId).toBe(2);
    expect(state.auth.user?.role).toBe('ROLE_INVESTOR');
  });
});

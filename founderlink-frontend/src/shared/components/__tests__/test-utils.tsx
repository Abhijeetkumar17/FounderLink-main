import React, { PropsWithChildren } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../../store/slices/authSlice';
import notificationReducer from '../../../store/slices/notificationSlice';

// ─── Test Store Factory ───
// Creates a fresh, isolated Redux store for each test to prevent state leaks.
export const createTestStore = (preloadedState: Record<string, any> = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationReducer,
    },
    preloadedState,
  });

// ─── Default authenticated state ───
export const authenticatedState = {
  auth: {
    token: 'test-jwt-token',
    user: { userId: 1, role: 'ROLE_FOUNDER', email: 'test@founderlink.com', name: 'Test User' },
    isAuthenticated: true,
  },
};

export const unauthenticatedState = {
  auth: {
    token: null,
    user: null,
    isAuthenticated: false,
  },
};

export const investorState = {
  auth: {
    token: 'test-jwt-token',
    user: { userId: 2, role: 'ROLE_INVESTOR', email: 'investor@founderlink.com', name: 'Investor User' },
    isAuthenticated: true,
  },
};

export const cofounderState = {
  auth: {
    token: 'test-jwt-token',
    user: { userId: 3, role: 'ROLE_COFOUNDER', email: 'cofounder@founderlink.com', name: 'CoFounder User' },
    isAuthenticated: true,
  },
};

export const adminState = {
  auth: {
    token: 'test-jwt-token',
    user: { userId: 4, role: 'ROLE_ADMIN', email: 'admin@founderlink.com', name: 'Admin User' },
    isAuthenticated: true,
  },
};

// ─── renderWithProviders ───
// Wraps a component with Redux Provider + Router for integration tests.
// Creates a fresh store per invocation to prevent test cross-contamination.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Record<string, any>;
  route?: string;
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    route = '/',
    initialEntries,
    ...renderOptions
  }: ExtendedRenderOptions = {},
) => {
  const store = createTestStore(preloadedState);

  const Wrapper = ({ children }: PropsWithChildren<{}>): React.ReactElement => {
    if (initialEntries) {
      return (
        <Provider store={store}>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </Provider>
      );
    }

    window.history.pushState({}, 'Test page', route);
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  };

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Re-export all RTL utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

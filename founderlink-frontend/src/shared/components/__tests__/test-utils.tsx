import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../../store/store';

/**
 * Custom strictly-typed test renderer
 * Wraps functional components in Global Providers (Redux, Router) avoiding boilerplate test setups.
 */
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Expose memory routing capabilities if needed, default is BrowserRouter
    route = '/',
    ...renderOptions
  } = {}
) => {
  window.history.pushState({}, 'Test page', route);

  const Wrapper = ({ children }: PropsWithChildren<{}>): React.ReactElement => {
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

// Re-export everything from RTL
export * from '@testing-library/react';

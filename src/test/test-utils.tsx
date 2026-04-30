import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ALL_PROPERTIES_ID,
  AnalyticsPropertyContext,
  type AnalyticsPropertyContextValue,
} from '@/contexts/AnalyticsPropertyContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const analyticsPropertyContext: AnalyticsPropertyContextValue = {
    properties: [],
    selectedPropertyId: ALL_PROPERTIES_ID,
    selectedProperty: null,
    isLoading: false,
    setSelectedPropertyId: () => undefined,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsPropertyContext.Provider value={analyticsPropertyContext}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AnalyticsPropertyContext.Provider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library and our custom render
export * from '@testing-library/react';
export { customRender as render, renderHook, userEvent };
export type { RenderOptions };

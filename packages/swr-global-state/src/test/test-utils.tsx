import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { SWRConfig } from 'swr';

/**
 * Custom render function that wraps components with SWRConfig for testing
 */
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  function Wrapper({ children }: { children: React.ReactNode; }) {
    return (
      <SWRConfig value={{ provider: () => new Map() }}>
        {children}
      </SWRConfig>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// 테스트에 필요한 Provider들을 감싸는 wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <MantineProvider>{children}</MantineProvider>;
};

// render 함수를 확장하여 wrapper를 기본으로 포함
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// 일반 테스트 유틸리티 함수 재내보내기
export * from '@testing-library/react';

// 확장된 render 함수 내보내기
export { customRender as render };

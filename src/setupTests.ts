import '@testing-library/jest-dom/vitest';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// React Testing Library의 matchers 확장
expect.extend(matchers);

// 각 테스트 후 cleanup 실행
afterEach(() => {
  cleanup();
});

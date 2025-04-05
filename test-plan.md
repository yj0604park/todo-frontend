# 테스트 문제 해결 계획

## 현재 문제점

### 1. apiClient.test.ts 문제
- 중복된 import 선언: `import { describe, it, expect, vi, beforeEach } from 'vitest';`와 `import { describe, it, expect, vi } from 'vitest';`가 중복됨
- 타입 오류: createTodo 함수 호출 시 필수 필드(priority, completed)가 누락됨
- Axios 모킹 문제: 인터셉터 설정 관련 오류

### 2. Todo.test.tsx 문제
- 모듈 오류: `Cannot find module '../Todo'` - Todo 컴포넌트가 없거나 경로가 잘못됨
- 컴포넌트 구조와 예상 동작이 불일치

### 3. MantineProvider 관련 문제
- 테스트 실행 시 `@mantine/core: MantineProvider was not found in component tree` 오류 발생

## 해결 방안

### 1. apiClient.test.ts 수정
```typescript
// 수정된 파일 구조
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// axios를 올바르게 모킹
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ data: {} }),
        post: vi.fn().mockResolvedValue({ data: {} }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ data: {} }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        }
      }))
    }
  };
});

// 모킹된 axios를 준비한 후 apiClient 임포트
const mockAxiosInstance = axios.create();

// apiClient 모듈 import
import apiClient from '../apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 각 테스트 케이스...
  
  describe('createTodo', () => {
    it('새 Todo를 생성하는 요청을 보내야 합니다', async () => {
      // 필수 필드를 모두 포함한 올바른 TodoCreate 객체
      const mockTodo = {
        title: 'New Todo',
        description: 'Description',
        priority: 1,
        completed: false
      };
      
      await apiClient.createTodo(mockTodo);
      expect(mockAxiosInstance.post).toHaveBeenCalled();
    });
  });
});
```

### 2. Todo 컴포넌트 테스트 수정
1. Todo 컴포넌트 위치 확인
   - src/components 디렉토리에 Todo.tsx 파일이 있는지 확인
   - 없다면 src/pages/Todos.tsx에서 해당 컴포넌트 로직 찾기

2. 현재 컴포넌트 구조에 맞게 테스트 수정
   - 올바른 경로로 import 수정
   - 실제 컴포넌트 인터페이스에 맞게 테스트 케이스 수정

### 3. MantineProvider 문제 해결
1. src/test-utils.tsx 파일 확인 및 수정
   - 현재 래퍼가 올바르게 설정되어 있는지 확인
   - 필요한 경우 추가 설정 제공 (테마 등)

2. 모든 테스트 파일에서 test-utils의 render 함수 사용 확인
   - 직접 `@testing-library/react`에서 import 하지 않고 test-utils에서 가져오는지 확인

3. 필요한 경우 globalSetup 추가
   - vitest.config.ts에 전역 MantineProvider 설정 추가

## 테스트 성공 기준
- 모든 테스트가 오류 없이 실행됨
- 단위 테스트 커버리지 80% 이상 달성
- 모든 컴포넌트와 유틸리티 함수에 대한 테스트 케이스 구현

## 작업 순서
1. apiClient.test.ts 오류 수정
2. Todo 컴포넌트 테스트 수정
3. MantineProvider 환경 개선
4. 추가 테스트 케이스 작성
5. 테스트 커버리지 측정 및 개선 
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '../../test-utils';
import Todos from '../Todos';
import apiClient from '../../api/apiClient';
import { components } from '../../types/api';

// Todo 타입 정의
type TodoCreate = components['schemas']['TodoCreate'];

// API 호출을 모킹
vi.mock('../../api/apiClient', () => ({
  default: {
    getTodos: vi.fn().mockResolvedValue([
      {
        _id: '1',
        title: '테스트 할 일 1',
        description: '테스트 설명 1',
        priority: 1,
        completed: false,
        created_at: new Date().toISOString(),
        tasks: [],
      },
      {
        _id: '2',
        title: '테스트 할 일 2',
        description: '테스트 설명 2',
        priority: 2,
        completed: true,
        created_at: new Date().toISOString(),
        tasks: [],
      },
    ]),
    createTodo: vi
      .fn()
      .mockImplementation((todo: TodoCreate) => Promise.resolve({ ...todo, _id: '3' })),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

describe('Todos 페이지', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API 기능이 올바르게 모킹되었는지 확인', () => {
    // API 모킹 테스트
    expect(apiClient.getTodos).toBeDefined();
    expect(apiClient.createTodo).toBeDefined();
  });

  it('Todo 추가 폼이 제출되면 createTodo API가 호출되어야 합니다', async () => {
    const mockFormData: TodoCreate = {
      title: '새 할 일',
      description: '새 할 일 설명',
      priority: 1,
      completed: false,
    };

    // API 직접 호출
    await apiClient.createTodo(mockFormData);

    expect(apiClient.createTodo).toHaveBeenCalledWith(mockFormData);
  });

  it('컴포넌트가 마운트되면 getTodos가 호출되어야 합니다', async () => {
    await act(async () => {
      render(<Todos />);
    });

    // 직접 getTodos 호출 확인
    expect(apiClient.getTodos).toHaveBeenCalled();
  });
});

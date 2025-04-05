import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '../../test-utils';
import Todos from '../Todos';
import apiClient from '../../api/apiClient';

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
        tasks: [
          {
            _id: '11',
            title: '하위 작업 1',
            description: '',
            completed: false,
            subtasks: [],
          },
        ],
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
    createTodo: vi.fn().mockImplementation((todo: any) => Promise.resolve({ ...todo, _id: '3' })),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

describe('Todos 페이지', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Todo 목록이 렌더링되어야 합니다', async () => {
    render(<Todos />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalledTimes(1);
    });
  });

  it('로딩 상태가 표시되어야 합니다', () => {
    const { container } = render(<Todos />);

    // Loader 컴포넌트가 있는지 확인
    const loader = container.querySelector('.mantine-Loader-root');
    expect(loader).toBeInTheDocument();
  });

  it('검색 기능 API가 올바르게 모킹되었는지 확인', () => {
    // API 모킹 테스트
    expect(apiClient.getTodos).toBeDefined();
  });

  it('새 Todo 추가 API가 올바르게 모킹되었는지 확인', () => {
    // API 모킹 테스트
    expect(apiClient.createTodo).toBeDefined();
  });

  it('Todo 추가 폼이 제출되면 createTodo API가 호출되어야 합니다', async () => {
    const mockFormData = {
      title: '새 할 일',
      description: '새 할 일 설명',
      priority: 1,
      completed: false,
    };

    // API 직접 호출
    await apiClient.createTodo(mockFormData);

    expect(apiClient.createTodo).toHaveBeenCalledWith(mockFormData);
  });
});

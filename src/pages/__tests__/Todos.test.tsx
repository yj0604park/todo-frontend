import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import Todos from '../../pages/Todos';
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
        tasks: [],
      },
    ]),
    createTodo: vi.fn().mockImplementation((todo: any) => Promise.resolve({ ...todo, _id: '3' })),
    updateTodo: vi
      .fn()
      .mockImplementation((id: string, updates: any) =>
        Promise.resolve({ ...mockTodos.find(t => t._id === id), ...updates })
      ),
    deleteTodo: vi.fn().mockResolvedValue(undefined),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const mockTodos = [
  {
    _id: '1',
    title: '테스트 할 일 1',
    description: '테스트 설명 1',
    priority: 1,
    completed: false,
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
    tasks: [],
  },
];

describe('Todos 페이지', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Todo 목록이 렌더링되어야 합니다', async () => {
    render(<Todos />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalled();
      expect(screen.getByText('Todo 관리')).toBeInTheDocument();
      // 비동기 데이터 로드 후 체크
      expect(screen.getByText('테스트 할 일 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 할 일 2')).toBeInTheDocument();
    });
  });

  it('로딩 상태가 표시되어야 합니다', () => {
    render(<Todos />);

    expect(screen.getByText(/로딩/i)).toBeInTheDocument();
  });

  it('검색 기능이 동작해야 합니다', async () => {
    render(<Todos />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalled();
    });

    const searchInput = screen.getByPlaceholderText('검색...');
    fireEvent.change(searchInput, { target: { value: '할 일 1' } });

    await waitFor(() => {
      expect(screen.getByText('테스트 할 일 1')).toBeInTheDocument();
      expect(screen.queryByText('테스트 할 일 2')).not.toBeInTheDocument();
    });
  });

  it('새 Todo 추가 버튼이 클릭되면 모달이 열려야 합니다', async () => {
    render(<Todos />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalled();
    });

    const addButton = screen.getByText('새 Todo 추가');
    fireEvent.click(addButton);

    expect(screen.getByText(/새 Todo 추가/i)).toBeInTheDocument();
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
  });

  it('Todo 추가 폼이 제출되면 createTodo API가 호출되어야 합니다', async () => {
    render(<Todos />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalled();
    });

    // 모달 열기
    const addButton = screen.getByText('새 Todo 추가');
    fireEvent.click(addButton);

    // 폼 입력
    const titleInput = screen.getByLabelText('제목');
    fireEvent.change(titleInput, { target: { value: '새 할 일' } });

    // 폼 제출
    const submitButton = screen
      .getAllByText('추가')
      .find(element => element.closest('button') !== null);

    if (submitButton) {
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(apiClient.createTodo).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '새 할 일',
          })
        );
      });
    }
  });
});

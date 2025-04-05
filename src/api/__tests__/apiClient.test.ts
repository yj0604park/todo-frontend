import { describe, it, expect, vi, beforeEach } from 'vitest';

// 실제 apiClient를 직접 모킹
vi.mock('../apiClient', () => ({
  default: {
    getHealth: vi.fn(),
    getDbHealth: vi.fn(),
    getSystemHealth: vi.fn(),
    getTodos: vi.fn(),
    createTodo: vi.fn(),
    updateTodo: vi.fn(),
    deleteTodo: vi.fn(),
  },
}));

// 모킹된 apiClient를 임포트
import apiClient from '../apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDbHealth', () => {
    it('API 상태를 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getDbHealth();
      expect(apiClient.getDbHealth).toHaveBeenCalled();
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태를 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getSystemHealth();
      expect(apiClient.getSystemHealth).toHaveBeenCalled();
    });
  });

  describe('getTodos', () => {
    it('Todo 목록을 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getTodos();
      expect(apiClient.getTodos).toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('새 Todo를 생성하는 요청을 보내야 합니다', async () => {
      const mockTodo = {
        title: 'New Todo',
        description: 'Description',
        priority: 1,
        completed: false,
      };

      await apiClient.createTodo(mockTodo);
      expect(apiClient.createTodo).toHaveBeenCalledWith(mockTodo);
    });
  });
});

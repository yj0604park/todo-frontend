import { describe, it, expect, vi, beforeEach } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

// axios를 모킹합니다
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
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

// 모킹된 axios로 실제 apiClient 모듈을 import하기 전에 테스트를 준비합니다
const mockAxiosInstance = axios.create();

// apiClient 모듈을 import합니다
import apiClient from '../apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('API 상태를 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getDbHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('getDbHealth', () => {
    it('DB 상태를 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getDbHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태를 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getSystemHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('getTodos', () => {
    it('Todo 목록을 가져오는 요청을 보내야 합니다', async () => {
      await apiClient.getTodos();
      expect(mockAxiosInstance.get).toHaveBeenCalled();
    });
  });

  describe('createTodo', () => {
    it('새 Todo를 생성하는 요청을 보내야 합니다', async () => {
      const mockTodo = { title: 'New Todo', description: 'Description' };
      const mockResponse = { data: { ...mockTodo, id: '1' } };
      (mockAxiosInstance.post as any).mockResolvedValueOnce(mockResponse);

      await apiClient.createTodo(mockTodo);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/todos', mockTodo);
    });
  });
});

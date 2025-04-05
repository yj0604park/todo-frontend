import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import apiClient from '../apiClient';

// axios를 모킹합니다
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

describe('apiClient', () => {
  const mockAxiosInstance = axios.create();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHealth', () => {
    it('API 상태를 가져오는 요청을 보내야 합니다', async () => {
      const mockResponse = { data: { status: 'ok' } };
      (mockAxiosInstance.get as any).mockResolvedValueOnce(mockResponse);

      await apiClient.getHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health');
    });
  });

  describe('getDbHealth', () => {
    it('DB 상태를 가져오는 요청을 보내야 합니다', async () => {
      const mockResponse = { data: { status: 'ok' } };
      (mockAxiosInstance.get as any).mockResolvedValueOnce(mockResponse);

      await apiClient.getDbHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health/db');
    });
  });

  describe('getSystemHealth', () => {
    it('시스템 상태를 가져오는 요청을 보내야 합니다', async () => {
      const mockResponse = {
        data: { cpu: 10, memory: { total: 1000, used: 500 }, disk: { total: 1000, used: 300 } },
      };
      (mockAxiosInstance.get as any).mockResolvedValueOnce(mockResponse);

      await apiClient.getSystemHealth();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/health/system');
    });
  });

  describe('getTodos', () => {
    it('Todo 목록을 가져오는 요청을 보내야 합니다', async () => {
      const mockResponse = { data: [{ id: '1', title: 'Test Todo' }] };
      (mockAxiosInstance.get as any).mockResolvedValueOnce(mockResponse);

      await apiClient.getTodos();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/todos');
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

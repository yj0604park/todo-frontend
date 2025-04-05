import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import Dashboard from '../Dashboard';
import apiClient from '../../api/apiClient';

// API 호출을 모킹
vi.mock('../../api/apiClient', () => ({
  default: {
    getTodos: vi.fn().mockResolvedValue([
      {
        _id: '1',
        title: '테스트 할 일',
        description: '테스트 설명',
        priority: 1,
        completed: false,
        created_at: '2023-01-01T00:00:00Z',
        tasks: [],
      },
      {
        _id: '2',
        title: '완료된 할 일',
        description: '완료된 설명',
        priority: 2,
        completed: true,
        created_at: '2023-01-02T00:00:00Z',
        tasks: [],
      },
    ]),
    getHealthStatus: vi.fn().mockResolvedValue({
      status: 'ok',
      uptime: 3600,
    }),
    getDbHealth: vi.fn().mockResolvedValue({
      status: 'ok',
      latency: 5,
    }),
    getSystemHealth: vi.fn().mockResolvedValue({
      cpu: 25,
      memory: { total: 16000, used: 8000, percent: 50 },
      disk: { total: 500000, used: 250000, percent: 50 },
    }),
  },
}));

describe('Dashboard 컴포넌트', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Dashboard 컴포넌트 렌더링 및 API 호출 확인', async () => {
    // 컴포넌트 렌더링
    render(<Dashboard />);

    // 기본 UI 확인
    expect(screen.getByText('대시보드')).toBeInTheDocument();

    // API 호출 확인
    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalledTimes(1);
      expect(apiClient.getHealthStatus).toHaveBeenCalledTimes(1);
      expect(apiClient.getDbHealth).toHaveBeenCalledTimes(1);
      expect(apiClient.getSystemHealth).toHaveBeenCalledTimes(1);
    });
  });

  it('API 오류가 발생하면 오류 메시지가 표시되어야 합니다', async () => {
    // API 오류 발생 시뮬레이션
    vi.mocked(apiClient.getTodos).mockRejectedValueOnce(new Error('API 오류'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument();
    });
  });
});

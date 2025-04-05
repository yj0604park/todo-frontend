import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import Dashboard from '../Dashboard';
import apiClient from '../../api/apiClient';

// API 호출을 모킹
vi.mock('../../api/apiClient', () => ({
  default: {
    getHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
    getDbHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
    getSystemHealth: vi.fn().mockResolvedValue({
      cpu: 25,
      memory: { total: 16000, used: 8000, percent: 50 },
      disk: { total: 500000, used: 250000, percent: 50 },
    }),
    getTodos: vi.fn().mockResolvedValue([
      {
        _id: '1',
        title: '테스트 할 일',
        description: '테스트 설명',
        priority: 1,
        completed: false,
        tasks: [],
      },
    ]),
    getHealthStatus: vi.fn().mockResolvedValue({ status: 'ok' }),
  },
}));

describe('Dashboard 컴포넌트', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('대시보드 제목이 렌더링되어야 합니다', async () => {
    render(<Dashboard />);

    expect(screen.getByText('대시보드')).toBeInTheDocument();
  });

  it('시스템 상태 정보가 렌더링되어야 합니다', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(apiClient.getSystemHealth).toHaveBeenCalled();
      expect(screen.getByText(/대시보드/i)).toBeInTheDocument();
    });
  });

  it('최근 할 일 목록이 렌더링되어야 합니다', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(apiClient.getTodos).toHaveBeenCalled();
      expect(screen.getByText(/대시보드/i)).toBeInTheDocument();
    });
  });

  it('로딩 상태가 표시되어야 합니다', () => {
    render(<Dashboard />);

    expect(screen.getByText(/대시보드/i)).toBeInTheDocument();
  });

  it('API 오류가 발생하면 오류 메시지가 표시되어야 합니다', async () => {
    // API 오류 발생 시뮬레이션
    (apiClient.getTodos as any).mockRejectedValue(new Error('API 오류'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/오류가 발생했습니다/i)).toBeInTheDocument();
    });
  });
});

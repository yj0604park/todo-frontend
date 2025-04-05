import { useEffect, useState } from 'react';
import { Stack, Title, Card, Group, Text, Grid, Loader, Progress } from '@mantine/core';
import { IconServer, IconDatabase, IconCpu } from '@tabler/icons-react';
import apiClient from '../api/apiClient';

const SystemStatus = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, dbData, systemData] = await Promise.all([
          apiClient.getHealthStatus(),
          apiClient.getDbHealth(),
          apiClient.getSystemHealth()
        ]);

        setHealthStatus(healthData);
        setDbStatus(dbData);
        setSystemStatus(systemData);
      } catch (err) {
        console.error('Error fetching system status:', err);
        setError('시스템 상태 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 5초마다 갱신
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Stack>
      <Title order={1} mb="md">시스템 상태</Title>

      {loading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconServer size={24} color="blue" />
                <Title order={4}>API 서버 상태</Title>
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>상태</Text>
                  <Text fw={500} c={healthStatus?.status === 'ok' ? 'green' : 'red'}>
                    {healthStatus?.status === 'ok' ? '정상' : '오류'}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text>업타임</Text>
                  <Text fw={500}>{formatUptime(healthStatus?.uptime || 0)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>버전</Text>
                  <Text fw={500}>{healthStatus?.version || '알 수 없음'}</Text>
                </Group>
                <Group justify="space-between">
                  <Text>현재 시각</Text>
                  <Text fw={500}>{healthStatus?.timestamp ? new Date(healthStatus.timestamp).toLocaleString('ko-KR') : '알 수 없음'}</Text>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconDatabase size={24} color="teal" />
                <Title order={4}>데이터베이스 상태</Title>
              </Group>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text>상태</Text>
                  <Text fw={500} c={dbStatus?.status === 'ok' ? 'green' : 'red'}>
                    {dbStatus?.status === 'ok' ? '정상' : '오류'}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text>응답 시간</Text>
                  <Text fw={500}>{dbStatus?.latency || 0}ms</Text>
                </Group>
                {dbStatus?.details && (
                  <Stack mt="md">
                    <Text fw={500} size="sm">추가 정보</Text>
                    <pre style={{ fontSize: '12px', maxHeight: '150px', overflow: 'auto' }}>
                      {JSON.stringify(dbStatus.details, null, 2)}
                    </pre>
                  </Stack>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group mb="md">
                <IconCpu size={24} color="orange" />
                <Title order={4}>시스템 리소스</Title>
              </Group>

              {systemStatus ? (
                <Stack gap="xs">
                  <Text>CPU 사용률</Text>
                  <Progress value={systemStatus.cpu || 0} color={getCpuColor(systemStatus.cpu)} mb="xs" />
                  <Group justify="space-between">
                    <Text size="xs">{systemStatus.cpu || 0}%</Text>
                    <Text size="xs" c={getCpuColor(systemStatus.cpu)}>
                      {getCpuStatus(systemStatus.cpu)}
                    </Text>
                  </Group>

                  <Text mt="md">메모리 사용률</Text>
                  <Progress value={systemStatus.memory?.percent || 0} color={getMemoryColor(systemStatus.memory?.percent)} mb="xs" />
                  <Group justify="space-between">
                    <Text size="xs">{systemStatus.memory?.percent || 0}%</Text>
                    <Text size="xs">{formatBytes(systemStatus.memory?.used || 0)} / {formatBytes(systemStatus.memory?.total || 0)}</Text>
                  </Group>

                  <Text mt="md">디스크 사용률</Text>
                  <Progress value={systemStatus.disk?.percent || 0} color={getDiskColor(systemStatus.disk?.percent)} mb="xs" />
                  <Group justify="space-between">
                    <Text size="xs">{systemStatus.disk?.percent || 0}%</Text>
                    <Text size="xs">{formatBytes(systemStatus.disk?.used || 0)} / {formatBytes(systemStatus.disk?.total || 0)}</Text>
                  </Group>
                </Stack>
              ) : (
                <Text c="dimmed">시스템 정보를 불러올 수 없습니다.</Text>
              )}
            </Card>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
};

// 시간 포매팅 함수
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}일`);
  if (hours > 0) parts.push(`${hours}시간`);
  if (minutes > 0) parts.push(`${minutes}분`);
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}초`);

  return parts.join(' ');
};

// 바이트 포매팅 함수
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// CPU 상태 색상
const getCpuColor = (value: number): string => {
  if (value >= 90) return 'red';
  if (value >= 70) return 'orange';
  if (value >= 50) return 'yellow';
  return 'green';
};

// 메모리 상태 색상
const getMemoryColor = (value: number): string => {
  if (value >= 90) return 'red';
  if (value >= 70) return 'orange';
  if (value >= 50) return 'teal';
  return 'blue';
};

// 디스크 상태 색상
const getDiskColor = (value: number): string => {
  if (value >= 90) return 'red';
  if (value >= 70) return 'orange';
  if (value >= 50) return 'green';
  return 'blue';
};

// CPU 상태 텍스트
const getCpuStatus = (value: number): string => {
  if (value >= 90) return '과부하';
  if (value >= 70) return '높음';
  if (value >= 50) return '보통';
  return '정상';
};

export default SystemStatus; 
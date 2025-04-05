import { useEffect, useState } from 'react';
import { Grid, Card, Text, Title, Group, RingProgress, Stack, SimpleGrid } from '@mantine/core';
import apiClient from '../api/apiClient';
import { components } from '../types/api';

type Todo = components['schemas']['TodoResponse'];

const Dashboard = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosData, healthData, dbData, systemData] = await Promise.all([
          apiClient.getTodos(),
          apiClient.getHealthStatus(),
          apiClient.getDbHealth(),
          apiClient.getSystemHealth()
        ]);

        setTodos(todosData);
        setHealthStatus(healthData);
        setDbStatus(dbData);
        setSystemStatus(systemData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 완료된 Todo 항목 비율 계산
  const completedTodosCount = todos.filter(todo => todo.completed).length;
  const completedTodosPercentage = todos.length > 0
    ? Math.round((completedTodosCount / todos.length) * 100)
    : 0;

  // 우선순위별 Todo 항목 수 계산
  const priorityCounts = todos.reduce((acc, todo) => {
    acc[todo.priority] = (acc[todo.priority] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <Stack>
      <Title order={1} mb="md">대시보드</Title>

      {loading ? (
        <Text>데이터를 불러오는 중...</Text>
      ) : error ? (
        <Text c="red">{error}</Text>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" size="sm">전체 Todo</Text>
              <Title order={3}>{todos.length}개</Title>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" size="sm">완료된 Todo</Text>
              <Group>
                <Title order={3}>{completedTodosCount}개</Title>
                <RingProgress
                  size={80}
                  thickness={8}
                  roundCaps
                  sections={[{ value: completedTodosPercentage, color: 'blue' }]}
                  label={
                    <Text size="xs" ta="center" fw={700}>
                      {completedTodosPercentage}%
                    </Text>
                  }
                />
              </Group>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" size="sm">시스템 상태</Text>
              <Title order={3} c={healthStatus?.status === 'ok' ? 'green' : 'red'}>
                {healthStatus?.status === 'ok' ? '정상' : '오류'}
              </Title>
              {healthStatus && (
                <Text size="xs" mt="xs">업타임: {healthStatus.uptime}초</Text>
              )}
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text c="dimmed" size="sm">DB 상태</Text>
              <Title order={3} c={dbStatus?.status === 'ok' ? 'green' : 'red'}>
                {dbStatus?.status === 'ok' ? '정상' : '오류'}
              </Title>
              {dbStatus && (
                <Text size="xs" mt="xs">응답 시간: {dbStatus.latency}ms</Text>
              )}
            </Card>
          </SimpleGrid>

          <Grid mt="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="sm">우선순위별 Todo</Title>
                {Object.entries(priorityCounts).length > 0 ? (
                  <Stack>
                    {Array.from({ length: 5 }, (_, i) => i + 1).map(priority => (
                      <Group key={priority} justify="space-between">
                        <Text>우선순위 {priority}</Text>
                        <Text fw={500}>{priorityCounts[priority] || 0}개</Text>
                      </Group>
                    ))}
                  </Stack>
                ) : (
                  <Text c="dimmed">데이터가 없습니다.</Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="sm">시스템 리소스</Title>
                {systemStatus ? (
                  <Stack>
                    <Group justify="space-between">
                      <Text>CPU 사용률</Text>
                      <Text fw={500}>{typeof systemStatus.cpu === 'number' ? systemStatus.cpu : 0}%</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>메모리 사용률</Text>
                      <Text fw={500}>{typeof systemStatus.memory?.percent === 'number' ? systemStatus.memory.percent : 0}%</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text>디스크 사용률</Text>
                      <Text fw={500}>{typeof systemStatus.disk?.percent === 'number' ? systemStatus.disk.percent : 0}%</Text>
                    </Group>
                  </Stack>
                ) : (
                  <Text c="dimmed">데이터가 없습니다.</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </>
      )}
    </Stack>
  );
};

export default Dashboard; 
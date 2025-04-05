import { Card, Group, Stack, Text, Title } from '@mantine/core';

const Items = () => {
  return (
    <Stack>
      <Title order={1} mb="md">아이템 관리</Title>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="center">
          <Text>아이템 관리는 구현 중입니다...</Text>
        </Group>
      </Card>
    </Stack>
  );
};

export default Items; 
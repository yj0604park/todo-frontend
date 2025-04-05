import { NavLink, Stack, Text, Group } from '@mantine/core';
import { useLocation, Link } from 'react-router-dom';
import { IconDashboard, IconList, IconPackage, IconServer } from '@tabler/icons-react';

const LINKS = [
  { path: '/', label: '대시보드', icon: <IconDashboard size={18} /> },
  { path: '/todos', label: 'Todo 관리', icon: <IconList size={18} /> },
  { path: '/items', label: '아이템 관리', icon: <IconPackage size={18} /> },
  { path: '/system', label: '시스템 상태', icon: <IconServer size={18} /> },
];

const AppNavbar = () => {
  const location = useLocation();

  return (
    <Stack p="md" gap="sm">
      <Text fw={700} size="lg" mb="md">
        메뉴
      </Text>

      {LINKS.map(link => (
        <NavLink
          key={link.path}
          component={Link}
          to={link.path}
          label={link.label}
          leftSection={link.icon}
          active={location.pathname === link.path}
          variant="light"
        />
      ))}

      <Text fw={500} mt="xl" mb="sm" size="sm">
        시스템 정보
      </Text>
      <Group gap="xs">
        <Text size="xs" c="dimmed">
          버전:
        </Text>
        <Text size="xs">v0.1.0</Text>
      </Group>
    </Stack>
  );
};

export default AppNavbar;

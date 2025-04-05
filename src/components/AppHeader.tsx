import { Group, Title, Button, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { components } from '../types/api';

type User = components['schemas']['User'];

const AppHeader = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return (
    <Group justify="space-between" h="100%" px="md">
      <Title order={2} c="blue.7">TodoAPI 대시보드</Title>

      {!loading && (
        <Group>
          {user ? (
            <>
              <Text>안녕하세요, {user.name}님</Text>
              <Button variant="subtle" onClick={handleLogout}>로그아웃</Button>
            </>
          ) : (
            <Text>로그인이 필요합니다</Text>
          )}
        </Group>
      )}
    </Group>
  );
};

export default AppHeader; 
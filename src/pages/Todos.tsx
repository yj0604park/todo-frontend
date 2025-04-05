import { useEffect, useState } from 'react';
import { Stack, Title, Card, Group, Button, Text, Checkbox, Badge, Table, ActionIcon, TextInput, Loader, Modal, Textarea, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import apiClient from '../api/apiClient';
import { components } from '../types/api';

type Todo = components['schemas']['TodoResponse'];
type TodoCreate = components['schemas']['TodoCreate'];
type TodoUpdate = components['schemas']['TodoUpdate'];

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState<TodoCreate>({
    title: '',
    description: '',
    priority: 1,
    completed: false
  });
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError('Todo 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    try {
      if (!formData.title) {
        setError('제목은 필수 입력사항입니다.');
        return;
      }

      const newTodo = await apiClient.createTodo(formData);
      setTodos(prev => [...prev, newTodo]);
      setFormData({
        title: '',
        description: '',
        priority: 1,
        completed: false
      });
      close();
    } catch (err) {
      console.error('Error creating todo:', err);
      setError('Todo를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateTodo = async () => {
    try {
      if (!selectedTodo || !formData.title) {
        setError('제목은 필수 입력사항입니다.');
        return;
      }

      if (selectedTodo._id) {
        const updatedTodo = await apiClient.updateTodo(selectedTodo._id, {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          completed: formData.completed
        });
        setTodos(prev => prev.map(todo => todo._id === updatedTodo._id ? updatedTodo : todo));
      }
      setFormData({
        title: '',
        description: '',
        priority: 1,
        completed: false
      });
      setSelectedTodo(null);
      close();
    } catch (err) {
      console.error('Error updating todo:', err);
      setError('Todo를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await apiClient.deleteTodo(todoId);
      setTodos(prev => prev.filter(todo => todo._id !== todoId));
    } catch (err) {
      console.error('Error deleting todo:', err);
      setError('Todo를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      if (todo._id) {
        const updatedTodo = await apiClient.updateTodo(todo._id, {
          completed: !todo.completed
        });
        setTodos(prev => prev.map(t => t._id === updatedTodo._id ? updatedTodo : t));
      }
    } catch (err) {
      console.error('Error toggling todo completion:', err);
      setError('Todo 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority,
      completed: todo.completed
    });
    setIsEditing(true);
    open();
  };

  const handleAdd = () => {
    setSelectedTodo(null);
    setFormData({
      title: '',
      description: '',
      priority: 1,
      completed: false
    });
    setIsEditing(false);
    open();
  };

  const filteredTodos = todos.filter(todo =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const priorityColors: Record<number, string> = {
    1: 'blue',
    2: 'green',
    3: 'yellow',
    4: 'orange',
    5: 'red'
  };

  return (
    <Stack>
      <Title order={1} mb="md">Todo 관리</Title>

      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '300px' }}
        />
        <Button leftSection={<IconPlus size={18} />} onClick={handleAdd}>새 Todo 추가</Button>
      </Group>

      {error && <Text c="red" mb="md">{error}</Text>}

      {loading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : filteredTodos.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text ta="center">Todo 항목이 없습니다.</Text>
        </Card>
      ) : (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>상태</Table.Th>
                <Table.Th>제목</Table.Th>
                <Table.Th>우선순위</Table.Th>
                <Table.Th>작업</Table.Th>
                <Table.Th>생성일</Table.Th>
                <Table.Th>액션</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTodos.map(todo => (
                <Table.Tr key={todo._id} opacity={todo.completed ? 0.7 : 1}>
                  <Table.Td>
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text td={todo.completed ? 'line-through' : 'none'}>
                      {todo.title}
                    </Text>
                    {todo.description && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {todo.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={priorityColors[todo.priority]}>
                      P{todo.priority}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{todo.tasks?.length || 0}개</Table.Td>
                  <Table.Td>
                    {todo.created_at ? new Date(todo.created_at).toLocaleDateString('ko-KR') : ''}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleEdit(todo)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDeleteTodo(todo._id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal opened={opened} onClose={close} title={isEditing ? "Todo 수정" : "새 Todo 추가"}>
        <Stack>
          <TextInput
            label="제목"
            placeholder="Todo 제목"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <Textarea
            label="설명"
            placeholder="설명(선택사항)"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <NumberInput
            label="우선순위"
            placeholder="우선순위"
            min={1}
            max={5}
            value={formData.priority || 1}
            onChange={(value) => setFormData(prev => ({ ...prev, priority: typeof value === 'number' ? value : 1 }))}
          />

          <Checkbox
            label="완료됨"
            checked={!!formData.completed}
            onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close}>취소</Button>
            <Button onClick={isEditing ? handleUpdateTodo : handleCreateTodo}>
              {isEditing ? "수정" : "추가"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default Todos; 
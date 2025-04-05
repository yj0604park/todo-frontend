import { useEffect, useState } from 'react';
import {
  Stack,
  Title,
  Card,
  Group,
  Button,
  Text,
  Checkbox,
  Badge,
  ActionIcon,
  TextInput,
  Loader,
  Modal,
  Textarea,
  NumberInput,
  Accordion,
  Menu,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconChevronDown } from '@tabler/icons-react';
import apiClient from '../api/apiClient';
import { components } from '../types/api';

type Todo = components['schemas']['TodoResponse'];
type TodoCreate = components['schemas']['TodoCreate'];
type TaskCreate = components['schemas']['TaskCreate'];
type SubtaskCreate = components['schemas']['SubtaskCreate'];

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);
  const [selectedSubtaskIndex, setSelectedSubtaskIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TodoCreate>({
    title: '',
    description: '',
    priority: 1,
    completed: false,
  });
  const [taskFormData, setTaskFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    completed: false,
  });
  const [subtaskFormData, setSubtaskFormData] = useState<SubtaskCreate>({
    title: '',
    completed: false,
  });
  const [todoModalOpened, { open: openTodoModal, close: closeTodoModal }] = useDisclosure(false);
  const [taskModalOpened, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [subtaskModalOpened, { open: openSubtaskModal, close: closeSubtaskModal }] =
    useDisclosure(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isTaskEditing, setIsTaskEditing] = useState(false);
  const [isSubtaskEditing, setIsSubtaskEditing] = useState(false);
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
        completed: false,
      });
      closeTodoModal();
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
          completed: formData.completed,
        });
        setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      }
      setFormData({
        title: '',
        description: '',
        priority: 1,
        completed: false,
      });
      setSelectedTodo(null);
      closeTodoModal();
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
          completed: !todo.completed,
        });
        setTodos(prev => prev.map(t => (t._id === updatedTodo._id ? updatedTodo : t)));
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
      completed: todo.completed,
    });
    setIsEditing(true);
    openTodoModal();
  };

  const handleAdd = () => {
    setSelectedTodo(null);
    setFormData({
      title: '',
      description: '',
      priority: 1,
      completed: false,
    });
    setIsEditing(false);
    openTodoModal();
  };

  // Task 관련 함수
  const handleAddTask = (todo: Todo) => {
    setSelectedTodo(todo);
    setTaskFormData({
      title: '',
      description: '',
      completed: false,
    });
    setIsTaskEditing(false);
    openTaskModal();
  };

  const handleEditTask = (todo: Todo, taskIndex: number) => {
    if (!todo.tasks || !todo.tasks[taskIndex]) return;

    const task = todo.tasks[taskIndex];
    setSelectedTodo(todo);
    setSelectedTaskIndex(taskIndex);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      completed: task.completed,
    });
    setIsTaskEditing(true);
    openTaskModal();
  };

  const handleCreateTask = async () => {
    try {
      if (!selectedTodo || !selectedTodo._id || !taskFormData.title) {
        setError('Todo와 Task 제목은 필수입니다.');
        return;
      }

      const updatedTodo = await apiClient.addTask(selectedTodo._id, taskFormData);
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      setTaskFormData({
        title: '',
        description: '',
        completed: false,
      });
      closeTaskModal();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Task를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateTask = async () => {
    try {
      if (!selectedTodo || !selectedTodo._id || selectedTaskIndex === null || !taskFormData.title) {
        setError('Todo와 Task 제목은 필수입니다.');
        return;
      }

      const updatedTodo = await apiClient.updateTask(
        selectedTodo._id,
        selectedTaskIndex,
        taskFormData
      );
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      setTaskFormData({
        title: '',
        description: '',
        completed: false,
      });
      setSelectedTaskIndex(null);
      closeTaskModal();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Task를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteTask = async (todoId: string, taskIndex: number) => {
    try {
      const updatedTodo = await apiClient.deleteTask(todoId, taskIndex);
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Task를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  // Subtask 관련 함수
  const handleAddSubtask = (todo: Todo, taskIndex: number) => {
    setSelectedTodo(todo);
    setSelectedTaskIndex(taskIndex);
    setSubtaskFormData({
      title: '',
      completed: false,
    });
    setIsSubtaskEditing(false);
    openSubtaskModal();
  };

  const handleEditSubtask = (todo: Todo, taskIndex: number, subtaskIndex: number) => {
    if (
      !todo.tasks ||
      !todo.tasks[taskIndex] ||
      !todo.tasks[taskIndex].subtasks ||
      !todo.tasks[taskIndex].subtasks[subtaskIndex]
    )
      return;

    const subtask = todo.tasks[taskIndex].subtasks[subtaskIndex];
    setSelectedTodo(todo);
    setSelectedTaskIndex(taskIndex);
    setSelectedSubtaskIndex(subtaskIndex);
    setSubtaskFormData({
      title: subtask.title,
      completed: subtask.completed,
    });
    setIsSubtaskEditing(true);
    openSubtaskModal();
  };

  const handleCreateSubtask = async () => {
    try {
      if (
        !selectedTodo ||
        !selectedTodo._id ||
        selectedTaskIndex === null ||
        !subtaskFormData.title
      ) {
        setError('Todo, Task, Subtask 제목은 필수입니다.');
        return;
      }

      const updatedTodo = await apiClient.addSubtask(
        selectedTodo._id,
        selectedTaskIndex,
        subtaskFormData
      );
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      setSubtaskFormData({
        title: '',
        completed: false,
      });
      closeSubtaskModal();
    } catch (err) {
      console.error('Error creating subtask:', err);
      setError('Subtask를 생성하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateSubtask = async () => {
    try {
      if (
        !selectedTodo ||
        !selectedTodo._id ||
        selectedTaskIndex === null ||
        selectedSubtaskIndex === null ||
        !subtaskFormData.title
      ) {
        setError('Todo, Task, Subtask 제목은 필수입니다.');
        return;
      }

      const updatedTodo = await apiClient.updateSubtask(
        selectedTodo._id,
        selectedTaskIndex,
        selectedSubtaskIndex,
        subtaskFormData
      );
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
      setSubtaskFormData({
        title: '',
        completed: false,
      });
      setSelectedSubtaskIndex(null);
      closeSubtaskModal();
    } catch (err) {
      console.error('Error updating subtask:', err);
      setError('Subtask를 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteSubtask = async (todoId: string, taskIndex: number, subtaskIndex: number) => {
    try {
      const updatedTodo = await apiClient.deleteSubtask(todoId, taskIndex, subtaskIndex);
      setTodos(prev => prev.map(todo => (todo._id === updatedTodo._id ? updatedTodo : todo)));
    } catch (err) {
      console.error('Error deleting subtask:', err);
      setError('Subtask를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const filteredTodos =
    todos?.filter(
      todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
    ) || [];

  const priorityColors: Record<number, string> = {
    1: 'blue',
    2: 'green',
    3: 'yellow',
    4: 'orange',
    5: 'red',
  };

  return (
    <Stack>
      <Title order={1} mb="md">
        Todo 관리
      </Title>

      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '300px' }}
        />
        <Button leftSection={<IconPlus size={18} />} onClick={handleAdd}>
          새 Todo 추가
        </Button>
      </Group>

      {error && (
        <Text c="red" mb="md">
          {error}
        </Text>
      )}

      {loading ? (
        <Group justify="center">
          <Loader />
        </Group>
      ) : filteredTodos.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text ta="center">Todo 항목이 없습니다.</Text>
        </Card>
      ) : (
        <Stack>
          {filteredTodos.map(todo => (
            <Accordion key={todo._id} variant="separated">
              <Accordion.Item value={todo._id || 'unknown'}>
                <Group gap="xs" wrap="nowrap">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    mr="xs"
                  />
                  <Accordion.Control>
                    <Group justify="space-between">
                      <Group>
                        <Text td={todo.completed ? 'line-through' : 'none'} fw={500}>
                          {todo.title}
                        </Text>
                        <Badge color={priorityColors[todo.priority]}>P{todo.priority}</Badge>
                      </Group>
                      <Group gap="xs">
                        <Badge>{todo.tasks?.length || 0}개 작업</Badge>
                        <Text size="xs" c="dimmed">
                          {todo.created_at
                            ? new Date(todo.created_at).toLocaleDateString('ko-KR')
                            : ''}
                        </Text>
                      </Group>
                    </Group>
                  </Accordion.Control>
                </Group>
                <Accordion.Panel>
                  <Stack>
                    {todo.description && (
                      <Text size="sm" pb="xs">
                        {todo.description}
                      </Text>
                    )}

                    <Group justify="space-between" mb="md">
                      <Text fw={500}>작업 목록</Text>
                      <Button
                        variant="light"
                        leftSection={<IconPlus size={16} />}
                        size="xs"
                        onClick={() => handleAddTask(todo)}
                      >
                        작업 추가
                      </Button>
                    </Group>

                    {!todo.tasks || todo.tasks.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center">
                        작업이 없습니다.
                      </Text>
                    ) : (
                      <Stack>
                        {todo.tasks.map((task, taskIndex) => (
                          <Card key={taskIndex} shadow="xs" p="md" radius="md" withBorder>
                            <Group justify="space-between" mb="xs">
                              <Group>
                                <Checkbox
                                  checked={task.completed}
                                  onChange={async () => {
                                    if (todo._id) {
                                      await apiClient.updateTask(todo._id, taskIndex, {
                                        ...task,
                                        completed: !task.completed,
                                      });
                                      fetchTodos();
                                    }
                                  }}
                                />
                                <Text td={task.completed ? 'line-through' : 'none'} fw={500}>
                                  {task.title}
                                </Text>
                              </Group>
                              <Menu shadow="md">
                                <Menu.Target>
                                  <ActionIcon>
                                    <IconChevronDown size={16} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Item
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => handleEditTask(todo, taskIndex)}
                                  >
                                    수정
                                  </Menu.Item>
                                  <Menu.Item
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => handleAddSubtask(todo, taskIndex)}
                                  >
                                    서브 작업 추가
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() =>
                                      todo._id && handleDeleteTask(todo._id, taskIndex)
                                    }
                                  >
                                    삭제
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>

                            {task.description && (
                              <Text size="sm" c="dimmed" mb="sm">
                                {task.description}
                              </Text>
                            )}

                            {task.subtasks && task.subtasks.length > 0 && (
                              <Stack gap="xs" pl="md" mt="sm">
                                <Text size="sm" fw={500}>
                                  서브 작업
                                </Text>
                                {task.subtasks.map((subtask, subtaskIndex) => (
                                  <Group key={subtaskIndex} justify="space-between">
                                    <Group>
                                      <Checkbox
                                        checked={subtask.completed}
                                        onChange={async () => {
                                          if (todo._id) {
                                            await apiClient.updateSubtask(
                                              todo._id,
                                              taskIndex,
                                              subtaskIndex,
                                              {
                                                ...subtask,
                                                completed: !subtask.completed,
                                              }
                                            );
                                            fetchTodos();
                                          }
                                        }}
                                        size="xs"
                                      />
                                      <Text
                                        size="sm"
                                        td={subtask.completed ? 'line-through' : 'none'}
                                      >
                                        {subtask.title}
                                      </Text>
                                    </Group>
                                    <Group gap="xs">
                                      <ActionIcon
                                        size="xs"
                                        color="blue"
                                        variant="subtle"
                                        onClick={() =>
                                          handleEditSubtask(todo, taskIndex, subtaskIndex)
                                        }
                                      >
                                        <IconEdit size={14} />
                                      </ActionIcon>
                                      <ActionIcon
                                        size="xs"
                                        color="red"
                                        variant="subtle"
                                        onClick={() =>
                                          todo._id &&
                                          handleDeleteSubtask(todo._id, taskIndex, subtaskIndex)
                                        }
                                      >
                                        <IconTrash size={14} />
                                      </ActionIcon>
                                    </Group>
                                  </Group>
                                ))}
                              </Stack>
                            )}
                          </Card>
                        ))}
                      </Stack>
                    )}

                    <Group justify="flex-end" gap="xs" mt="md">
                      <Button
                        variant="light"
                        leftSection={<IconEdit size={16} />}
                        size="sm"
                        onClick={() => handleEdit(todo)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="light"
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        size="sm"
                        onClick={() => todo._id && handleDeleteTodo(todo._id)}
                      >
                        삭제
                      </Button>
                    </Group>
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Todo 모달 */}
      <Modal
        opened={todoModalOpened}
        onClose={closeTodoModal}
        title={isEditing ? 'Todo 수정' : '새 Todo 추가'}
      >
        <Stack>
          <TextInput
            label="제목"
            placeholder="Todo 제목"
            required
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <Textarea
            label="설명"
            placeholder="설명(선택사항)"
            value={formData.description || ''}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <NumberInput
            label="우선순위"
            placeholder="우선순위"
            min={1}
            max={5}
            value={formData.priority || 1}
            onChange={value =>
              setFormData(prev => ({ ...prev, priority: typeof value === 'number' ? value : 1 }))
            }
          />

          <Checkbox
            label="완료됨"
            checked={!!formData.completed}
            onChange={e => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeTodoModal}>
              취소
            </Button>
            <Button onClick={isEditing ? handleUpdateTodo : handleCreateTodo}>
              {isEditing ? '수정' : '추가'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Task 모달 */}
      <Modal
        opened={taskModalOpened}
        onClose={closeTaskModal}
        title={isTaskEditing ? '작업 수정' : '새 작업 추가'}
      >
        <Stack>
          <TextInput
            label="제목"
            placeholder="작업 제목"
            required
            value={taskFormData.title}
            onChange={e => setTaskFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <Textarea
            label="설명"
            placeholder="설명(선택사항)"
            value={taskFormData.description || ''}
            onChange={e => setTaskFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <Checkbox
            label="완료됨"
            checked={!!taskFormData.completed}
            onChange={e => setTaskFormData(prev => ({ ...prev, completed: e.target.checked }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeTaskModal}>
              취소
            </Button>
            <Button onClick={isTaskEditing ? handleUpdateTask : handleCreateTask}>
              {isTaskEditing ? '수정' : '추가'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Subtask 모달 */}
      <Modal
        opened={subtaskModalOpened}
        onClose={closeSubtaskModal}
        title={isSubtaskEditing ? '서브 작업 수정' : '새 서브 작업 추가'}
      >
        <Stack>
          <TextInput
            label="제목"
            placeholder="서브 작업 제목"
            required
            value={subtaskFormData.title}
            onChange={e => setSubtaskFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <Checkbox
            label="완료됨"
            checked={!!subtaskFormData.completed}
            onChange={e => setSubtaskFormData(prev => ({ ...prev, completed: e.target.checked }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={closeSubtaskModal}>
              취소
            </Button>
            <Button onClick={isSubtaskEditing ? handleUpdateSubtask : handleCreateSubtask}>
              {isSubtaskEditing ? '수정' : '추가'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default Todos;

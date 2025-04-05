import { useEffect, useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  Title,
  Table,
  Button,
  TextInput,
  NumberInput,
  ActionIcon,
  Modal,
  Textarea,
  Badge,
  Loader,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import apiClient from '../api/apiClient';
import { components } from '../types/api';

type Item = components['schemas']['ItemResponse'];
type ItemCreate = components['schemas']['ItemCreate'];
type ItemUpdate = components['schemas']['ItemUpdate'];

const Items = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ItemCreate>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getItems();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('아이템 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      if (!formData.name || formData.price <= 0) {
        setError('이름과 유효한 가격은 필수 입력사항입니다.');
        return;
      }

      const newItem = await apiClient.createItem(formData);
      setItems(prev => [...prev, newItem]);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
      });
      close();
    } catch (err) {
      console.error('Error creating item:', err);
      setError('아이템을 생성하는 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateItem = async () => {
    try {
      if (!selectedItem || !selectedItem._id || !formData.name || formData.price <= 0) {
        setError('이름과 유효한 가격은 필수 입력사항입니다.');
        return;
      }

      const updatedItem = await apiClient.updateItem(selectedItem._id, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
      });
      setItems(prev => prev.map(item => (item._id === updatedItem._id ? updatedItem : item)));
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
      });
      setSelectedItem(null);
      close();
    } catch (err) {
      console.error('Error updating item:', err);
      setError('아이템을 수정하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await apiClient.deleteItem(itemId);
      setItems(prev => prev.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('아이템을 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      stock: item.stock || 0,
    });
    setIsEditing(true);
    open();
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
    });
    setIsEditing(false);
    open();
  };

  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 재고 상태에 따른 색상
  const getStockColor = (stock: number): string => {
    if (stock <= 0) return 'red';
    if (stock < 10) return 'orange';
    if (stock < 50) return 'yellow';
    return 'green';
  };

  return (
    <Stack>
      <Title order={1} mb="md">
        아이템 관리
      </Title>

      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="아이템 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          leftSection={<IconSearch size={16} />}
          style={{ width: '300px' }}
        />
        <Button leftSection={<IconPlus size={18} />} onClick={handleAdd}>
          새 아이템 추가
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
      ) : filteredItems.length === 0 ? (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text ta="center">아이템이 없습니다.</Text>
        </Card>
      ) : (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>이름</Table.Th>
                <Table.Th>설명</Table.Th>
                <Table.Th>가격</Table.Th>
                <Table.Th>재고</Table.Th>
                <Table.Th>액션</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredItems.map(item => (
                <Table.Tr key={item._id}>
                  <Table.Td>
                    <Text fw={500}>{item.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text lineClamp={2}>{item.description || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{item.price.toLocaleString('ko-KR')}원</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStockColor(item.stock || 0)}>{item.stock || 0}개</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue" onClick={() => handleEdit(item)}>
                        <IconEdit size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => item._id && handleDeleteItem(item._id)}
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

      <Modal opened={opened} onClose={close} title={isEditing ? '아이템 수정' : '새 아이템 추가'}>
        <Stack>
          <TextInput
            label="이름"
            placeholder="아이템 이름"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <Textarea
            label="설명"
            placeholder="아이템 설명"
            value={formData.description || ''}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />

          <NumberInput
            label="가격"
            placeholder="가격"
            min={0}
            value={formData.price}
            onChange={value =>
              setFormData(prev => ({ ...prev, price: typeof value === 'number' ? value : 0 }))
            }
            required
          />

          <NumberInput
            label="재고"
            placeholder="재고"
            min={0}
            value={formData.stock || 0}
            onChange={value =>
              setFormData(prev => ({ ...prev, stock: typeof value === 'number' ? value : 0 }))
            }
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close}>
              취소
            </Button>
            <Button onClick={isEditing ? handleUpdateItem : handleCreateItem}>
              {isEditing ? '수정' : '추가'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default Items;

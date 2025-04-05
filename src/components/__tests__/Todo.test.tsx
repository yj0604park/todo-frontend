import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Todo } from '../Todo';

// Todo 컴포넌트가 있다고 가정하고 테스트를 작성합니다.
// 실제 컴포넌트가 다른 구조를 가지고 있다면 테스트를 적절히 수정해야 합니다.

const mockTodo = {
  _id: '1',
  title: '테스트 할 일',
  description: '이것은 테스트용 할 일입니다',
  completed: false,
  priority: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tasks: [
    {
      _id: '11',
      title: '하위 작업 1',
      description: '',
      completed: false,
      subtasks: [],
    },
  ],
};

const mockHandleDelete = vi.fn();
const mockHandleEdit = vi.fn();
const mockHandleCheck = vi.fn();

describe('Todo 컴포넌트', () => {
  it('할 일 제목이 렌더링되어야 합니다', () => {
    render(
      <Todo
        todo={mockTodo}
        onDelete={mockHandleDelete}
        onEdit={mockHandleEdit}
        onCheck={mockHandleCheck}
      />
    );

    expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
  });

  it('설명이 표시되어야 합니다', () => {
    render(
      <Todo
        todo={mockTodo}
        onDelete={mockHandleDelete}
        onEdit={mockHandleEdit}
        onCheck={mockHandleCheck}
      />
    );

    expect(screen.getByText('이것은 테스트용 할 일입니다')).toBeInTheDocument();
  });

  it('삭제 버튼을 클릭하면 삭제 핸들러가 호출되어야 합니다', () => {
    render(
      <Todo
        todo={mockTodo}
        onDelete={mockHandleDelete}
        onEdit={mockHandleEdit}
        onCheck={mockHandleCheck}
      />
    );

    const deleteButton =
      screen.getByLabelText('삭제') || screen.getByRole('button', { name: /삭제/i });
    fireEvent.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalledWith(mockTodo._id);
  });

  it('수정 버튼을 클릭하면 수정 핸들러가 호출되어야 합니다', () => {
    render(
      <Todo
        todo={mockTodo}
        onDelete={mockHandleDelete}
        onEdit={mockHandleEdit}
        onCheck={mockHandleCheck}
      />
    );

    const editButton =
      screen.getByLabelText('수정') || screen.getByRole('button', { name: /수정/i });
    fireEvent.click(editButton);

    expect(mockHandleEdit).toHaveBeenCalledWith(mockTodo);
  });

  it('체크박스를 클릭하면 체크 핸들러가 호출되어야 합니다', () => {
    render(
      <Todo
        todo={mockTodo}
        onDelete={mockHandleDelete}
        onEdit={mockHandleEdit}
        onCheck={mockHandleCheck}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockHandleCheck).toHaveBeenCalledWith(mockTodo._id, !mockTodo.completed);
  });
});

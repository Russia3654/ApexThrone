import { act, renderHook } from '@testing-library/react';
import { ApiError } from '../api/client';
import { useDeleteAction } from './useDeleteAction';

const remove = jest.fn();
const onDeleted = jest.fn();

test('deletes nothing until asked', () => {
  renderHook(() => useDeleteAction(remove, onDeleted));

  expect(remove).not.toHaveBeenCalled();
});

test('runs the delete, then calls onDeleted', async () => {
  remove.mockResolvedValue(undefined);
  const { result } = renderHook(() => useDeleteAction(remove, onDeleted));

  await act(() => result.current.handleDelete());

  expect(remove).toHaveBeenCalledTimes(1);
  expect(onDeleted).toHaveBeenCalledTimes(1);
});

test('a refusal is shown and the screen stays', async () => {
  remove.mockRejectedValue(new ApiError('Core pages cannot be deleted', 409));
  const { result } = renderHook(() => useDeleteAction(remove, onDeleted));

  await act(() => result.current.handleDelete());

  expect(result.current.error).toBe('Core pages cannot be deleted');
  expect(result.current.deleting).toBe(false);
  expect(onDeleted).not.toHaveBeenCalled();
});

test('a second click while deleting is ignored', async () => {
  remove.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useDeleteAction(remove, onDeleted));

  await act(async () => {
    result.current.handleDelete();
  });
  await act(async () => {
    result.current.handleDelete();
  });

  expect(remove).toHaveBeenCalledTimes(1);
});

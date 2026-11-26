import { act, renderHook } from '@testing-library/react';
import { deletePage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { useDeletePage } from './useDeletePage';

jest.mock('../api/adminPagesApi');
const deletePageMock = deletePage as jest.MockedFunction<typeof deletePage>;
const onDeleted = jest.fn();

test('deletes nothing until asked', () => {
  renderHook(() => useDeletePage(5, onDeleted));

  expect(deletePageMock).not.toHaveBeenCalled();
});

test('deletes that page, then calls onDeleted', async () => {
  deletePageMock.mockResolvedValue();
  const { result } = renderHook(() => useDeletePage(5, onDeleted));

  await act(() => result.current.handleDelete());

  expect(deletePageMock).toHaveBeenCalledWith(5);
  expect(onDeleted).toHaveBeenCalledTimes(1);
});

test('a refusal is shown and the screen stays', async () => {
  deletePageMock.mockRejectedValue(new ApiError('Core pages cannot be deleted', 409));
  const { result } = renderHook(() => useDeletePage(1, onDeleted));

  await act(() => result.current.handleDelete());

  expect(result.current.error).toBe('Core pages cannot be deleted');
  expect(result.current.deleting).toBe(false);
  expect(onDeleted).not.toHaveBeenCalled();
});

test('a second click while deleting is ignored', async () => {
  deletePageMock.mockReturnValue(new Promise(() => {}));
  const { result } = renderHook(() => useDeletePage(5, onDeleted));

  await act(async () => {
    result.current.handleDelete();
  });
  await act(async () => {
    result.current.handleDelete();
  });

  expect(deletePageMock).toHaveBeenCalledTimes(1);
});

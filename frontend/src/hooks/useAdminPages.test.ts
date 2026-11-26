import { renderHook, waitFor } from '@testing-library/react';
import { listPages } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { useAdminPages } from './useAdminPages';

jest.mock('../api/adminPagesApi');
const listPagesMock = listPages as jest.MockedFunction<typeof listPages>;

test('starts as loading', () => {
  listPagesMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useAdminPages());

  expect(result.current).toEqual({ status: 'loading' });
});

test('becomes ready with the pages grouped', async () => {
  listPagesMock.mockResolvedValue([]);

  const { result } = renderHook(() => useAdminPages());

  await waitFor(() => expect(result.current).toEqual({ status: 'ready', groups: [] }));
});

test('an expired session says how to sign in again', async () => {
  listPagesMock.mockRejectedValue(new ApiError('Not logged in', 401));

  const { result } = renderHook(() => useAdminPages());

  await waitFor(() =>
    expect(result.current).toEqual({
      status: 'error',
      message: 'Your session has expired. Reload the page to sign in again.',
    }),
  );
});

test('any other failure gives a general message', async () => {
  listPagesMock.mockRejectedValue(new ApiError('Server error', 500));

  const { result } = renderHook(() => useAdminPages());

  await waitFor(() =>
    expect(result.current).toEqual({
      status: 'error',
      message: 'The pages could not be loaded.',
    }),
  );
});

import { renderHook, waitFor } from '@testing-library/react';
import { getAdminPage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { AdminPage } from '../types/api';
import { SESSION_EXPIRED } from '../utils/messages';
import { useAdminPage } from './useAdminPage';

jest.mock('../api/adminPagesApi');
const getAdminPageMock = getAdminPage as jest.MockedFunction<typeof getAdminPage>;

const page = { id: 5, menu_name: 'Our history' } as AdminPage;

test('starts as loading and asks for that id', () => {
  getAdminPageMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useAdminPage(5));

  expect(result.current).toEqual({ status: 'loading' });
  expect(getAdminPageMock).toHaveBeenCalledWith(5);
});

test('gives the page once it arrives', async () => {
  getAdminPageMock.mockResolvedValue(page);

  const { result } = renderHook(() => useAdminPage(5));

  await waitFor(() => expect(result.current).toEqual({ status: 'ready', page }));
});

test.each([
  [new ApiError('Page not found', 404), 'Page not found.'],
  [new ApiError('Invalid id', 400), 'Page not found.'],
  [new ApiError('Not logged in', 401), SESSION_EXPIRED],
  [new TypeError('Failed to fetch'), 'The page could not be loaded.'],
])('explains the failure (%s)', async (failure, message) => {
  getAdminPageMock.mockRejectedValue(failure);

  const { result } = renderHook(() => useAdminPage(5));

  await waitFor(() => expect(result.current).toEqual({ status: 'error', message }));
});

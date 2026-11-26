import { renderHook, waitFor } from '@testing-library/react';
import { getMenu } from '../api/publicApi';
import { useMenu } from './useMenu';

jest.mock('../api/publicApi');
const getMenuMock = getMenu as jest.MockedFunction<typeof getMenu>;

const tournaments = { to: '/tournaments', label: 'Tournaments' };

test('starts as loading, with the fixed Tournaments link already there', () => {
  getMenuMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useMenu());

  expect(result.current.status).toBe('loading');
  expect(result.current.links).toEqual([tournaments]);
});

test('adds the CMS pages after Tournaments, in the order the server sends', async () => {
  getMenuMock.mockResolvedValue([
    { menu_name: 'Rules & FAQ', slug: 'rules' },
    { menu_name: 'About', slug: 'about' },
  ]);

  const { result } = renderHook(() => useMenu());

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.links).toEqual([
    tournaments,
    { to: '/rules', label: 'Rules & FAQ' },
    { to: '/about', label: 'About' },
  ]);
});

test('an empty menu leaves only Tournaments', async () => {
  getMenuMock.mockResolvedValue([]);

  const { result } = renderHook(() => useMenu());

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current.links).toEqual([tournaments]);
});

test('a failed request reports an error and keeps Tournaments', async () => {
  getMenuMock.mockRejectedValue(new Error('Server down'));

  const { result } = renderHook(() => useMenu());

  await waitFor(() => expect(result.current.status).toBe('error'));
  expect(result.current.links).toEqual([tournaments]);
});

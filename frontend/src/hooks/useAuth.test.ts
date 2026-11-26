import { act, renderHook, waitFor } from '@testing-library/react';
import { getCurrentAdmin, login, logout } from '../api/adminApi';
import { AuthProvider } from '../context/AuthContext';
import { mockAdmin } from '../mock/adminMock';
import { useAuth } from './useAuth';

jest.mock('../api/adminApi');
const getCurrentAdminMock = getCurrentAdmin as jest.MockedFunction<typeof getCurrentAdmin>;
const loginMock = login as jest.MockedFunction<typeof login>;
const logoutMock = logout as jest.MockedFunction<typeof logout>;

const credentials = { username: 'admin', password: 'fake-test-password' };
const authenticated = { status: 'authenticated', admin: mockAdmin };

// runs the hook inside the provider and waits until the first "who am I" answer has arrived
async function renderLoaded() {
  const view = renderHook(() => useAuth(), { wrapper: AuthProvider });
  await waitFor(() => expect(view.result.current.state.status).not.toBe('loading'));
  return view;
}

test('starts as loading', () => {
  getCurrentAdminMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

  expect(result.current.state).toEqual({ status: 'loading' });
});

test('an existing session means authenticated', async () => {
  getCurrentAdminMock.mockResolvedValue(mockAdmin);

  const { result } = await renderLoaded();

  expect(result.current.state).toEqual(authenticated);
});

test('no session means anonymous', async () => {
  getCurrentAdminMock.mockResolvedValue(null);

  const { result } = await renderLoaded();

  expect(result.current.state).toEqual({ status: 'anonymous' });
});

test('a failed check means error, not logged out', async () => {
  getCurrentAdminMock.mockRejectedValue(new Error('Server down'));

  const { result } = await renderLoaded();

  expect(result.current.state).toEqual({ status: 'error' });
});

test('signIn sends the credentials and becomes authenticated', async () => {
  getCurrentAdminMock.mockResolvedValue(null);
  loginMock.mockResolvedValue(mockAdmin);
  const { result } = await renderLoaded();

  await act(() => result.current.signIn(credentials));

  expect(loginMock).toHaveBeenCalledWith(credentials);
  expect(result.current.state).toEqual(authenticated);
});

test('a refused signIn passes the error on and stays anonymous', async () => {
  getCurrentAdminMock.mockResolvedValue(null);
  loginMock.mockRejectedValue(new Error('Invalid credentials'));
  const { result } = await renderLoaded();

  await act(async () => {
    await expect(result.current.signIn(credentials)).rejects.toThrow('Invalid credentials');
  });

  expect(result.current.state).toEqual({ status: 'anonymous' });
});

test('signOut logs out on the server and becomes anonymous', async () => {
  getCurrentAdminMock.mockResolvedValue(mockAdmin);
  logoutMock.mockResolvedValue();
  const { result } = await renderLoaded();

  await act(() => result.current.signOut());

  expect(logoutMock).toHaveBeenCalled();
  expect(result.current.state).toEqual({ status: 'anonymous' });
});

test('a failed signOut does not pretend to be logged out', async () => {
  getCurrentAdminMock.mockResolvedValue(mockAdmin);
  logoutMock.mockRejectedValue(new Error('Server down'));
  const { result } = await renderLoaded();

  await act(async () => {
    await expect(result.current.signOut()).rejects.toThrow('Server down');
  });

  expect(result.current.state).toEqual(authenticated);
});

test('useAuth outside the provider fails with a clear message', () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});

  expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside AuthProvider');
});

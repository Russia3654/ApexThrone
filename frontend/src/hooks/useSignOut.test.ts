import { act, renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useSignOut } from './useSignOut';

jest.mock('./useAuth');
const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;
const signOutMock = jest.fn();

beforeEach(() => {
  useAuthMock.mockReturnValue({
    state: { status: 'anonymous' },
    signIn: jest.fn(),
    signOut: signOutMock,
  });
});

test('signs out, and stays busy until the screen is replaced', async () => {
  signOutMock.mockResolvedValue(undefined);
  const { result } = renderHook(() => useSignOut());

  await act(() => result.current.handleSignOut());

  expect(signOutMock).toHaveBeenCalledTimes(1);
  expect(result.current.failed).toBe(false);
  expect(result.current.busy).toBe(true);
});

test('a failed sign out is reported and can be tried again', async () => {
  signOutMock.mockRejectedValue(new Error('Server down'));
  const { result } = renderHook(() => useSignOut());

  await act(() => result.current.handleSignOut());

  expect(result.current.failed).toBe(true);
  expect(result.current.busy).toBe(false);
});

test('a new try clears the previous failure', async () => {
  signOutMock.mockRejectedValueOnce(new Error('Server down')).mockResolvedValueOnce(undefined);
  const { result } = renderHook(() => useSignOut());
  await act(() => result.current.handleSignOut());

  await act(() => result.current.handleSignOut());

  expect(result.current.failed).toBe(false);
});

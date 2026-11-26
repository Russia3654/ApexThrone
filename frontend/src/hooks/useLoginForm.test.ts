import { act, renderHook } from '@testing-library/react';
import { ChangeEvent, FormEvent } from 'react';
import { ApiError } from '../api/client';
import { useAuth } from './useAuth';
import { useLoginForm } from './useLoginForm';

jest.mock('./useAuth');
const useAuthMock = useAuth as jest.MockedFunction<typeof useAuth>;
const signInMock = jest.fn();

beforeEach(() => {
  useAuthMock.mockReturnValue({
    state: { status: 'anonymous' },
    signIn: signInMock,
    signOut: jest.fn(),
  });
});

function submitEvent() {
  return { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;
}

function typed(name: string, value: string) {
  return { target: { name, value } } as ChangeEvent<HTMLInputElement>;
}

// the hook with both fields already typed in
function renderFilled() {
  const view = renderHook(() => useLoginForm());
  act(() => view.result.current.handleChange(typed('username', 'admin')));
  act(() => view.result.current.handleChange(typed('password', 'fake-test-password')));
  return view;
}

const filled = { username: 'admin', password: 'fake-test-password' };

test('typing updates only the field that changed', () => {
  const { result } = renderHook(() => useLoginForm());

  act(() => result.current.handleChange(typed('username', 'admin')));

  expect(result.current.values).toEqual({ username: 'admin', password: '' });
});

test('empty fields show a message and send nothing', async () => {
  const { result } = renderHook(() => useLoginForm());
  const event = submitEvent();

  await act(() => result.current.handleSubmit(event));

  expect(event.preventDefault).toHaveBeenCalled();
  expect(result.current.error).toBe('Enter your username and password.');
  expect(signInMock).not.toHaveBeenCalled();
});

test('a filled form signs in with the typed values', async () => {
  signInMock.mockResolvedValue(undefined);
  const { result } = renderFilled();

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(signInMock).toHaveBeenCalledWith(filled);
  expect(result.current.error).toBeNull();
});

test('a refused login shows the server message and allows a new try', async () => {
  signInMock.mockRejectedValue(new ApiError('Invalid credentials', 401));
  const { result } = renderFilled();

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(result.current.error).toBe('Invalid credentials');
  expect(result.current.submitting).toBe(false);
});

test('a network failure shows a readable message', async () => {
  signInMock.mockRejectedValue(new TypeError('Failed to fetch'));
  const { result } = renderFilled();

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(result.current.error).toBe('The server could not be reached.');
});

test('a second submit while waiting is ignored', async () => {
  signInMock.mockReturnValue(new Promise(() => {}));
  const { result } = renderFilled();

  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });
  expect(result.current.submitting).toBe(true);
  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });

  expect(signInMock).toHaveBeenCalledTimes(1);
});

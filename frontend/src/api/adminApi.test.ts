import { mockAdmin } from '../mock/adminMock';
import { getCurrentAdmin, login, logout } from './adminApi';

let mockUseMock = false;
jest.mock('./config', () => ({
  get USE_MOCK() {
    return mockUseMock;
  },
}));

const fetchMock = jest.fn();
const credentials = { username: 'admin', password: 'fake-test-password' };

function serverAnswers(status: number, body: unknown) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

beforeEach(() => {
  mockUseMock = false;
  global.fetch = fetchMock;
});

describe('real API', () => {
  test('login sends the credentials as a JSON POST and returns the admin', async () => {
    serverAnswers(200, { admin: mockAdmin });

    await expect(login(credentials)).resolves.toEqual(mockAdmin);
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  });

  test.each([
    [401, 'Invalid credentials'],
    [429, 'Too many attempts, try again later'],
  ])('a refused login (%i) passes on the server message', async (status, message) => {
    serverAnswers(status, { error: message });

    await expect(login(credentials)).rejects.toMatchObject({ status, message });
  });

  test('getCurrentAdmin returns the admin when there is a session', async () => {
    serverAnswers(200, { admin: mockAdmin });

    await expect(getCurrentAdmin()).resolves.toEqual(mockAdmin);
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/me');
  });

  test('getCurrentAdmin returns null on 401: nobody is logged in', async () => {
    serverAnswers(401, { error: 'Not logged in' });

    await expect(getCurrentAdmin()).resolves.toBeNull();
  });

  test('getCurrentAdmin does not hide other failures', async () => {
    serverAnswers(500, { error: 'Server error' });

    await expect(getCurrentAdmin()).rejects.toMatchObject({ status: 500 });
  });

  test('getCurrentAdmin does not hide a network failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getCurrentAdmin()).rejects.toThrow('Failed to fetch');
  });

  test('logout is a POST without a body', async () => {
    serverAnswers(200, { ok: true });

    await expect(logout()).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });
});

describe('mock mode', () => {
  test('logs in and out without calling the server', async () => {
    mockUseMock = true;

    await expect(getCurrentAdmin()).resolves.toBeNull();
    await expect(login({ ...credentials, username: 'someone' })).rejects.toMatchObject({
      status: 401,
    });
    await expect(login(credentials)).resolves.toEqual(mockAdmin);
    await expect(getCurrentAdmin()).resolves.toEqual(mockAdmin);
    await logout();
    await expect(getCurrentAdmin()).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

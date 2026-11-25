import { mockPages } from '../mock/publicMock';
import { getMenu, getPage } from './publicApi';

let mockUseMock = false;
jest.mock('./config', () => ({
  get USE_MOCK() {
    return mockUseMock;
  },
}));

const fetchMock = jest.fn();

function serverAnswers(status: number, body: unknown) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

function serverAnswersHtml(status: number) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.reject(new SyntaxError('Unexpected token <')),
  });
}

beforeEach(() => {
  mockUseMock = false;
  global.fetch = fetchMock;
});

describe('real API', () => {
  test('getMenu asks /api/menu and returns the list', async () => {
    const menu = [{ menu_name: 'About', slug: 'about' }];
    serverAnswers(200, { menu });

    await expect(getMenu()).resolves.toEqual(menu);
    expect(fetchMock).toHaveBeenCalledWith('/api/menu');
  });

  test('getPage asks for the slug and returns the page', async () => {
    const page = { menu_name: 'About', slug: 'about', subjects: [] };
    serverAnswers(200, { page });

    await expect(getPage('about')).resolves.toEqual(page);
    expect(fetchMock).toHaveBeenCalledWith('/api/page?slug=about');
  });

  test('getPage encodes the slug so it cannot add parameters', async () => {
    serverAnswers(400, { error: 'Invalid slug' });

    await expect(getPage('a&b=1')).rejects.toThrow('Invalid slug');
    expect(fetchMock).toHaveBeenCalledWith('/api/page?slug=a%26b%3D1');
  });

  test('a 404 becomes an ApiError with the status and the server message', async () => {
    serverAnswers(404, { error: 'Page not found' });

    await expect(getPage('nothing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Page not found',
    });
  });

  test('an error answer that is not JSON gives a generic message', async () => {
    serverAnswersHtml(502);

    await expect(getMenu()).rejects.toMatchObject({
      status: 502,
      message: 'Something went wrong',
    });
  });

  test('a 200 answer that is not JSON is still an error', async () => {
    serverAnswersHtml(200);

    await expect(getMenu()).rejects.toMatchObject({ name: 'ApiError', status: 200 });
  });

  test('a network failure is passed to the caller', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getMenu()).rejects.toThrow('Failed to fetch');
  });
});

describe('mock mode', () => {
  beforeEach(() => {
    mockUseMock = true;
  });

  test('getMenu returns only names and slugs, without calling the server', async () => {
    await expect(getMenu()).resolves.toStrictEqual(
      mockPages.map((page) => ({ menu_name: page.menu_name, slug: page.slug })),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('getPage returns the matching mock page', async () => {
    await expect(getPage('about')).resolves.toEqual(mockPages[0]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('getPage gives the same 404 as the server for an unknown slug', async () => {
    await expect(getPage('nothing')).rejects.toMatchObject({
      status: 404,
      message: 'Page not found',
    });
  });
});

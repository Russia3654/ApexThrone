import { PageInput } from '../types/api';
import { createPage, deletePage, getAdminPage, listPages, updatePage } from './adminPagesApi';

const fetchMock = jest.fn();

function serverAnswers(status: number, body: unknown) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

const input: PageInput = {
  parent_ID: 2,
  menu_name: 'Our history',
  slug: 'history',
  position: 1,
  visible: 1,
  status: 'published',
  max_element: 10,
};

function postWith(data?: PageInput) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

beforeEach(() => {
  global.fetch = fetchMock;
});

test('listPages returns the list without its wrapper', async () => {
  serverAnswers(200, { pages: [{ id: 1 }] });

  await expect(listPages()).resolves.toEqual([{ id: 1 }]);
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/pages');
});

test('getAdminPage asks for one page by id', async () => {
  serverAnswers(200, { page: { id: 5 } });

  await expect(getAdminPage(5)).resolves.toEqual({ id: 5 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/page?id=5');
});

test('createPage posts the fields', async () => {
  serverAnswers(201, { page: { id: 9 } });

  await expect(createPage(input)).resolves.toEqual({ id: 9 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/pages', postWith(input));
});

test('updatePage posts the fields to the page being changed', async () => {
  serverAnswers(200, { page: { id: 5 } });

  await expect(updatePage(5, input)).resolves.toEqual({ id: 5 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/page/update?id=5', postWith(input));
});

test('deletePage is a POST, never a GET', async () => {
  serverAnswers(200, { ok: true });

  await expect(deletePage(5)).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/page/delete?id=5', postWith());
});

test('a refusal from PHP reaches the screen with its message', async () => {
  serverAnswers(409, { error: 'Core pages cannot be deleted' });

  await expect(deletePage(1)).rejects.toMatchObject({
    status: 409,
    message: 'Core pages cannot be deleted',
  });
});

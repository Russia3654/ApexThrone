import { SubjectInput } from '../types/api';
import {
  createSubject,
  deleteSubject,
  getAdminSubject,
  listSubjects,
  updateSubject,
} from './adminSubjectsApi';

const fetchMock = jest.fn();

function serverAnswers(status: number, body: unknown) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

const input: SubjectInput = {
  page_ID: 2,
  menu_name: 'Who we are',
  position: 1,
  visible: 1,
  content: 'A community.',
  status: 'published',
};

function postWith(data?: SubjectInput) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

beforeEach(() => {
  global.fetch = fetchMock;
});

test('listSubjects returns the list without its wrapper', async () => {
  serverAnswers(200, { subjects: [{ id: 1 }] });

  await expect(listSubjects()).resolves.toEqual([{ id: 1 }]);
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/subjects');
});

test('getAdminSubject asks for one subject by id', async () => {
  serverAnswers(200, { subject: { id: 5 } });

  await expect(getAdminSubject(5)).resolves.toEqual({ id: 5 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/subject?id=5');
});

test('createSubject posts the fields', async () => {
  serverAnswers(201, { subject: { id: 9 } });

  await expect(createSubject(input)).resolves.toEqual({ id: 9 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/subjects', postWith(input));
});

test('updateSubject posts the fields to the subject being changed', async () => {
  serverAnswers(200, { subject: { id: 5 } });

  await expect(updateSubject(5, input)).resolves.toEqual({ id: 5 });
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/subject/update?id=5', postWith(input));
});

test('deleteSubject is a POST, never a GET', async () => {
  serverAnswers(200, { ok: true });

  await expect(deleteSubject(5)).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith('/api/admin/subject/delete?id=5', postWith());
});

test('a refusal from PHP reaches the screen with its message', async () => {
  serverAnswers(409, { error: 'Page is full' });

  await expect(createSubject(input)).rejects.toMatchObject({
    status: 409,
    message: 'Page is full',
  });
});

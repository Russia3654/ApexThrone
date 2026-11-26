import { act, renderHook, waitFor } from '@testing-library/react';
import { ChangeEvent, FormEvent } from 'react';
import { listPages } from '../api/adminPagesApi';
import { createSubject, getAdminSubject, updateSubject } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { AdminPage, AdminSubject } from '../types/api';
import { SESSION_EXPIRED } from '../utils/messages';
import { useSubjectForm } from './useSubjectForm';

jest.mock('../api/adminPagesApi');
jest.mock('../api/adminSubjectsApi');
const listPagesMock = listPages as jest.MockedFunction<typeof listPages>;
const getSubjectMock = getAdminSubject as jest.MockedFunction<typeof getAdminSubject>;
const createMock = createSubject as jest.MockedFunction<typeof createSubject>;
const updateMock = updateSubject as jest.MockedFunction<typeof updateSubject>;

const pages = [
  { id: 1, parent_ID: null, menu_name: 'Rules' },
  { id: 2, parent_ID: null, menu_name: 'About' },
  { id: 5, parent_ID: 2, menu_name: 'History' },
] as AdminPage[];

const existing: AdminSubject = {
  id: 4,
  page_ID: 5,
  menu_name: 'Beginnings',
  position: 1,
  visible: true,
  content: 'Text',
  status: 'published',
  created_at: '',
  updated_at: '',
};

const onSaved = jest.fn();

beforeEach(() => {
  listPagesMock.mockResolvedValue(pages);
  getSubjectMock.mockResolvedValue(existing);
});

async function renderLoaded(id: number | null) {
  const view = renderHook(() => useSubjectForm(id, onSaved));
  await waitFor(() => expect(view.result.current.load.status).not.toBe('loading'));
  return view;
}

function submitEvent() {
  return { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;
}

function changed(target: { name: string; type: string; value: string; checked?: boolean }) {
  return { target } as unknown as ChangeEvent<HTMLInputElement>;
}

test('a new subject lists every page, subpages after their parent, first one selected', async () => {
  const { result } = await renderLoaded(null);

  expect(result.current.load).toEqual({
    status: 'ready',
    pageOptions: [
      { value: '1', label: 'Rules' },
      { value: '2', label: 'About' },
      { value: '5', label: 'About / History' },
    ],
  });
  expect(result.current.values.page_ID).toBe('1');
  expect(getSubjectMock).not.toHaveBeenCalled();
});

test('editing fills the form with the subject', async () => {
  const { result } = await renderLoaded(4);

  expect(getSubjectMock).toHaveBeenCalledWith(4);
  expect(result.current.values).toMatchObject({ page_ID: '5', menu_name: 'Beginnings' });
});

test.each([
  [new ApiError('Subject not found', 404), 'Subject not found.'],
  [new ApiError('Not logged in', 401), SESSION_EXPIRED],
])('explains a loading failure (%s)', async (failure, message) => {
  getSubjectMock.mockRejectedValue(failure);

  const { result } = await renderLoaded(4);

  expect(result.current.load).toEqual({ status: 'error', message });
});

test('the content box and the checkbox update the values', async () => {
  const { result } = await renderLoaded(null);

  act(() =>
    result.current.handleChange(changed({ name: 'content', type: 'textarea', value: 'Hello' })),
  );
  act(() =>
    result.current.handleChange(
      changed({ name: 'visible', type: 'checkbox', value: 'on', checked: true }),
    ),
  );

  expect(result.current.values).toMatchObject({ content: 'Hello', visible: true });
});

test('saving a new subject creates it, then calls onSaved', async () => {
  createMock.mockResolvedValue(existing);
  const { result } = await renderLoaded(null);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ page_ID: 1 }));
  expect(updateMock).not.toHaveBeenCalled();
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('saving an existing subject updates it', async () => {
  updateMock.mockResolvedValue(existing);
  const { result } = await renderLoaded(4);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(updateMock).toHaveBeenCalledWith(4, expect.objectContaining({ page_ID: 5 }));
  expect(createMock).not.toHaveBeenCalled();
});

test('a full page is reported and the form stays', async () => {
  createMock.mockRejectedValue(new ApiError('Page is full', 409));
  const { result } = await renderLoaded(null);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(result.current.error).toBe('Page is full');
  expect(result.current.saving).toBe(false);
  expect(onSaved).not.toHaveBeenCalled();
});

test('a second submit while saving is ignored', async () => {
  createMock.mockReturnValue(new Promise(() => {}));
  const { result } = await renderLoaded(null);

  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });
  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });

  expect(createMock).toHaveBeenCalledTimes(1);
});

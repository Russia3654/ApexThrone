import { act, renderHook, waitFor } from '@testing-library/react';
import { ChangeEvent, FormEvent } from 'react';
import { createPage, listPages, updatePage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { AdminPage } from '../types/api';
import { usePageForm } from './usePageForm';

jest.mock('../api/adminPagesApi');
const listPagesMock = listPages as jest.MockedFunction<typeof listPages>;
const createPageMock = createPage as jest.MockedFunction<typeof createPage>;
const updatePageMock = updatePage as jest.MockedFunction<typeof updatePage>;

function page(id: number, parent_ID: number | null): AdminPage {
  return {
    id,
    parent_ID,
    menu_name: `Page ${id}`,
    slug: `page-${id}`,
    position: 1,
    visible: true,
    status: 'published',
    max_element: 10,
    created_at: '2026-11-26 10:00:00',
    updated_at: '2026-11-26 10:00:00',
  };
}

const pages = [page(1, null), page(2, null), page(5, 2)];
const onSaved = jest.fn();

beforeEach(() => {
  listPagesMock.mockResolvedValue(pages);
});

async function renderReady(id: number | null) {
  const view = renderHook(() => usePageForm(id, onSaved));
  await waitFor(() => expect(view.result.current.load.status).not.toBe('loading'));
  return view;
}

function submitEvent() {
  return { preventDefault: jest.fn() } as unknown as FormEvent<HTMLFormElement>;
}

function changed(target: { name: string; type: string; value: string; checked?: boolean }) {
  return { target } as unknown as ChangeEvent<HTMLInputElement>;
}

test('a new page offers the core pages as parents, the first one selected', async () => {
  const { result } = await renderReady(null);

  expect(result.current.load).toEqual({
    status: 'ready',
    corePages: [pages[0], pages[1]],
    isCore: false,
  });
  expect(result.current.values.parent_ID).toBe('1');
});

test('editing fills the form with the page, and knows a subpage from a core page', async () => {
  const { result: subpage } = await renderReady(5);
  const { result: core } = await renderReady(2);

  expect(subpage.current.values).toMatchObject({ parent_ID: '2', slug: 'page-5' });
  expect(subpage.current.load).toMatchObject({ isCore: false });
  expect(core.current.load).toMatchObject({ isCore: true });
});

test('an id that does not exist is reported', async () => {
  const { result } = await renderReady(999);

  expect(result.current.load).toEqual({ status: 'error', message: 'Page not found.' });
});

test('typing changes text fields, and a checkbox gives true or false', async () => {
  const { result } = await renderReady(null);

  act(() => result.current.handleChange(changed({ name: 'slug', type: 'text', value: 'history' })));
  act(() =>
    result.current.handleChange(
      changed({ name: 'visible', type: 'checkbox', value: 'on', checked: true }),
    ),
  );

  expect(result.current.values).toMatchObject({ slug: 'history', visible: true });
});

test('saving a new page creates it, then calls onSaved', async () => {
  createPageMock.mockResolvedValue(page(9, 1));
  const { result } = await renderReady(null);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(createPageMock).toHaveBeenCalledWith(expect.objectContaining({ parent_ID: 1 }));
  expect(updatePageMock).not.toHaveBeenCalled();
  expect(onSaved).toHaveBeenCalledTimes(1);
});

test('saving an existing page updates it', async () => {
  updatePageMock.mockResolvedValue(page(5, 2));
  const { result } = await renderReady(5);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(updatePageMock).toHaveBeenCalledWith(5, expect.objectContaining({ slug: 'page-5' }));
  expect(createPageMock).not.toHaveBeenCalled();
});

test('a refusal from PHP is shown and the form stays', async () => {
  createPageMock.mockRejectedValue(new ApiError('Slug already used', 409));
  const { result } = await renderReady(null);

  await act(() => result.current.handleSubmit(submitEvent()));

  expect(result.current.error).toBe('Slug already used');
  expect(result.current.saving).toBe(false);
  expect(onSaved).not.toHaveBeenCalled();
});

test('a second submit while saving is ignored', async () => {
  createPageMock.mockReturnValue(new Promise(() => {}));
  const { result } = await renderReady(null);

  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });
  await act(async () => {
    result.current.handleSubmit(submitEvent());
  });

  expect(createPageMock).toHaveBeenCalledTimes(1);
});

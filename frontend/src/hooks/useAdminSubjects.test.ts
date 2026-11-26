import { renderHook, waitFor } from '@testing-library/react';
import { listPages } from '../api/adminPagesApi';
import { listSubjects } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { AdminPage, AdminSubject } from '../types/api';
import { SESSION_EXPIRED } from '../utils/messages';
import { useAdminSubjects } from './useAdminSubjects';

jest.mock('../api/adminPagesApi');
jest.mock('../api/adminSubjectsApi');
const listPagesMock = listPages as jest.MockedFunction<typeof listPages>;
const listSubjectsMock = listSubjects as jest.MockedFunction<typeof listSubjects>;

const about = { id: 2, menu_name: 'About' } as AdminPage;

function subject(id: number, page_ID: number) {
  return { id, page_ID, menu_name: `Subject ${id}` } as AdminSubject;
}

beforeEach(() => {
  listPagesMock.mockResolvedValue([about]);
});

test('starts as loading', () => {
  listSubjectsMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useAdminSubjects());

  expect(result.current).toEqual({ status: 'loading' });
});

test('gives each subject the name of its page, in the order PHP sent', async () => {
  listSubjectsMock.mockResolvedValue([subject(7, 2), subject(3, 2)]);

  const { result } = renderHook(() => useAdminSubjects());

  await waitFor(() =>
    expect(result.current).toEqual({
      status: 'ready',
      items: [
        { subject: subject(7, 2), pageName: 'About' },
        { subject: subject(3, 2), pageName: 'About' },
      ],
    }),
  );
});

test('does not crash when a page is missing from the list', async () => {
  listSubjectsMock.mockResolvedValue([subject(1, 99)]);

  const { result } = renderHook(() => useAdminSubjects());

  await waitFor(() =>
    expect(result.current).toMatchObject({ items: [{ pageName: 'Unknown page' }] }),
  );
});

test.each([
  [new ApiError('Not logged in', 401), SESSION_EXPIRED],
  [new TypeError('Failed to fetch'), 'The subjects could not be loaded.'],
])('explains the failure (%s)', async (failure, message) => {
  listSubjectsMock.mockRejectedValue(failure);

  const { result } = renderHook(() => useAdminSubjects());

  await waitFor(() => expect(result.current).toEqual({ status: 'error', message }));
});

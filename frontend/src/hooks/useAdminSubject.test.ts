import { renderHook, waitFor } from '@testing-library/react';
import { listPages } from '../api/adminPagesApi';
import { getAdminSubject } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { AdminPage, AdminSubject } from '../types/api';
import { SESSION_EXPIRED } from '../utils/messages';
import { useAdminSubject } from './useAdminSubject';

jest.mock('../api/adminPagesApi');
jest.mock('../api/adminSubjectsApi');
const listPagesMock = listPages as jest.MockedFunction<typeof listPages>;
const getSubjectMock = getAdminSubject as jest.MockedFunction<typeof getAdminSubject>;

const about = { id: 2, menu_name: 'About' } as AdminPage;
const subject = { id: 4, page_ID: 2, menu_name: 'Who we are' } as AdminSubject;

beforeEach(() => {
  listPagesMock.mockResolvedValue([about]);
});

test('starts as loading and asks for that id', () => {
  getSubjectMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderHook(() => useAdminSubject(4));

  expect(result.current).toEqual({ status: 'loading' });
  expect(getSubjectMock).toHaveBeenCalledWith(4);
});

test('gives the subject with the name of its page', async () => {
  getSubjectMock.mockResolvedValue(subject);

  const { result } = renderHook(() => useAdminSubject(4));

  await waitFor(() =>
    expect(result.current).toEqual({ status: 'ready', item: { subject, pageName: 'About' } }),
  );
});

test.each([
  [new ApiError('Subject not found', 404), 'Subject not found.'],
  [new ApiError('Invalid id', 400), 'Subject not found.'],
  [new ApiError('Not logged in', 401), SESSION_EXPIRED],
  [new TypeError('Failed to fetch'), 'The subject could not be loaded.'],
])('explains the failure (%s)', async (failure, message) => {
  getSubjectMock.mockRejectedValue(failure);

  const { result } = renderHook(() => useAdminSubject(4));

  await waitFor(() => expect(result.current).toEqual({ status: 'error', message }));
});

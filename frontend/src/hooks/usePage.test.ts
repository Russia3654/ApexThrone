import { act, renderHook, waitFor } from '@testing-library/react';
import { ApiError } from '../api/client';
import { getPage } from '../api/publicApi';
import { PublicPage } from '../types/api';
import { usePage } from './usePage';

jest.mock('../api/publicApi');
const getPageMock = getPage as jest.MockedFunction<typeof getPage>;

function makePage(slug: string): PublicPage {
  return { menu_name: slug, slug, subjects: [], subpages: [] };
}

function renderUsePage(slug: string) {
  return renderHook((props: { slug: string }) => usePage(props.slug), { initialProps: { slug } });
}

test('starts as loading and asks for the slug', () => {
  getPageMock.mockReturnValue(new Promise(() => {}));

  const { result } = renderUsePage('about');

  expect(result.current).toEqual({ status: 'loading' });
  expect(getPageMock).toHaveBeenCalledWith('about');
});

test('gives the page once it arrives', async () => {
  getPageMock.mockResolvedValue(makePage('about'));

  const { result } = renderUsePage('about');

  await waitFor(() => expect(result.current.status).toBe('ready'));
  expect(result.current).toEqual({ status: 'ready', page: makePage('about') });
});

test.each([404, 400])('a %i answer means "not found"', async (status) => {
  getPageMock.mockRejectedValue(new ApiError('nope', status));

  const { result } = renderUsePage('missing');

  await waitFor(() => expect(result.current).toEqual({ status: 'notFound' }));
});

test.each([new ApiError('Server error', 500), new TypeError('Failed to fetch')])(
  'any other failure (%s) means "error"',
  async (failure) => {
    getPageMock.mockRejectedValue(failure);

    const { result } = renderUsePage('about');

    await waitFor(() => expect(result.current).toEqual({ status: 'error' }));
  },
);

test('when the slug changes it shows loading, never the previous page', async () => {
  getPageMock.mockResolvedValue(makePage('about'));
  const { result, rerender } = renderUsePage('about');
  await waitFor(() => expect(result.current.status).toBe('ready'));

  getPageMock.mockReturnValue(new Promise(() => {}));
  rerender({ slug: 'rules' });

  expect(result.current).toEqual({ status: 'loading' });
});

test('a late answer for the previous slug is ignored', async () => {
  let answerOldRequest: (page: PublicPage) => void = () => {};
  getPageMock
    .mockReturnValueOnce(
      new Promise((resolve) => {
        answerOldRequest = resolve;
      }),
    )
    .mockResolvedValueOnce(makePage('rules'));

  const { result, rerender } = renderUsePage('about');
  rerender({ slug: 'rules' });
  await waitFor(() => expect(result.current.status).toBe('ready'));

  await act(async () => {
    answerOldRequest(makePage('about'));
  });

  expect(result.current).toEqual({ status: 'ready', page: makePage('rules') });
});

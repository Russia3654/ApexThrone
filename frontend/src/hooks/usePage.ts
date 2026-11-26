import { useEffect, useState } from 'react';
import { ApiError } from '../api/client';
import { getPage } from '../api/publicApi';
import { PublicPage } from '../types/api';

type PageState =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error' }
  | { status: 'ready'; page: PublicPage };

export function usePage(slug: string): PageState {
  const [result, setResult] = useState<{ slug: string; state: PageState }>();

  useEffect(() => {
    let active = true;
    getPage(slug)
      .then((page) => {
        if (active) setResult({ slug, state: { status: 'ready', page } });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const missing = error instanceof ApiError && [400, 404].includes(error.status);
        setResult({ slug, state: { status: missing ? 'notFound' : 'error' } });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return result?.slug === slug ? result.state : { status: 'loading' };
}

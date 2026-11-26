import { useEffect, useState } from 'react';
import { getAdminPage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { AdminPage } from '../types/api';
import { SESSION_EXPIRED } from '../utils/messages';

type AdminPageState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; page: AdminPage };

function failureMessage(error: unknown): string {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 401) return SESSION_EXPIRED;
  if (status === 400 || status === 404) return 'Page not found.';
  return 'The page could not be loaded.';
}

export function useAdminPage(id: number): AdminPageState {
  const [state, setState] = useState<AdminPageState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getAdminPage(id)
      .then((page) => {
        if (active) setState({ status: 'ready', page });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: failureMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [id]);

  return state;
}

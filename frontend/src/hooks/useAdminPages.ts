import { useEffect, useState } from 'react';
import { listPages } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { groupPages, PageGroup } from '../utils/groupPages';
import { SESSION_EXPIRED } from '../utils/messages';

type AdminPagesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; groups: PageGroup[] };

export function useAdminPages(): AdminPagesState {
  const [state, setState] = useState<AdminPagesState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    listPages()
      .then((pages) => {
        if (active) setState({ status: 'ready', groups: groupPages(pages) });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const expired = error instanceof ApiError && error.status === 401;
        const message = expired ? SESSION_EXPIRED : 'The pages could not be loaded.';
        setState({ status: 'error', message });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

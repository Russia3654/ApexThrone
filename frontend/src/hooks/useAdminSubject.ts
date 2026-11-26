import { useEffect, useState } from 'react';
import { listPages } from '../api/adminPagesApi';
import { getAdminSubject } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { SubjectListItem } from '../types/ui';
import { SESSION_EXPIRED } from '../utils/messages';

type AdminSubjectState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; item: SubjectListItem };

function failureMessage(error: unknown): string {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 401) return SESSION_EXPIRED;
  if (status === 400 || status === 404) return 'Subject not found.';
  return 'The subject could not be loaded.';
}

export function useAdminSubject(id: number): AdminSubjectState {
  const [state, setState] = useState<AdminSubjectState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    Promise.all([getAdminSubject(id), listPages()])
      .then(([subject, pages]) => {
        if (!active) return;
        const pageName =
          pages.find((page) => page.id === subject.page_ID)?.menu_name ?? 'Unknown page';
        setState({ status: 'ready', item: { subject, pageName } });
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

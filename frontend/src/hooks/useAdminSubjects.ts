import { useEffect, useState } from 'react';
import { listPages } from '../api/adminPagesApi';
import { listSubjects } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { SubjectListItem } from '../types/ui';
import { SESSION_EXPIRED } from '../utils/messages';

type AdminSubjectsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: SubjectListItem[] };

export function useAdminSubjects(): AdminSubjectsState {
  const [state, setState] = useState<AdminSubjectsState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    Promise.all([listSubjects(), listPages()])
      .then(([subjects, pages]) => {
        if (!active) return;
        const items = subjects.map((subject) => ({
          subject,
          pageName: pages.find((page) => page.id === subject.page_ID)?.menu_name ?? 'Unknown page',
        }));
        setState({ status: 'ready', items });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const expired = error instanceof ApiError && error.status === 401;
        setState({
          status: 'error',
          message: expired ? SESSION_EXPIRED : 'The subjects could not be loaded.',
        });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

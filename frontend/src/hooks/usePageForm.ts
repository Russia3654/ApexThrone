import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { createPage, listPages, updatePage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';
import { AdminPage } from '../types/api';
import { EMPTY_PAGE_VALUES, toPageInput, toPageValues } from '../utils/pageForm';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; corePages: AdminPage[]; isCore: boolean };

export function usePageForm(id: number | null, onSaved: () => void) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [values, setValues] = useState(EMPTY_PAGE_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    listPages()
      .then((pages) => {
        if (!active) return;
        const corePages = pages.filter((page) => page.parent_ID === null);
        const existing = pages.find((page) => page.id === id);
        if (id !== null && !existing) {
          setLoad({ status: 'error', message: 'Page not found.' });
          return;
        }
        setValues(
          existing
            ? toPageValues(existing)
            : { ...EMPTY_PAGE_VALUES, parent_ID: String(corePages[0]?.id ?? '') },
        );
        setLoad({ status: 'ready', corePages, isCore: existing?.parent_ID === null });
      })
      .catch(() => {
        if (active) setLoad({ status: 'error', message: 'The form could not be loaded.' });
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setValues((current) => ({ ...current, [target.name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const input = toPageInput(values);
      if (id === null) {
        await createPage(input);
      } else {
        await updatePage(id, input);
      }
      onSaved();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The server could not be reached.');
      setSaving(false);
    }
  };

  return { load, values, error, saving, handleChange, handleSubmit };
}

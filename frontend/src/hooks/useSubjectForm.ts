import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { listPages } from '../api/adminPagesApi';
import { createSubject, getAdminSubject, updateSubject } from '../api/adminSubjectsApi';
import { ApiError } from '../api/client';
import { SESSION_EXPIRED } from '../utils/messages';
import {
  EMPTY_SUBJECT_VALUES,
  toPageOptions,
  toSubjectInput,
  toSubjectValues,
} from '../utils/subjectForm';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; pageOptions: ReturnType<typeof toPageOptions> };

function loadMessage(error: unknown): string {
  const status = error instanceof ApiError ? error.status : 0;
  if (status === 401) return SESSION_EXPIRED;
  if (status === 400 || status === 404) return 'Subject not found.';
  return 'The form could not be loaded.';
}

export function useSubjectForm(id: number | null, onSaved: () => void) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [values, setValues] = useState(EMPTY_SUBJECT_VALUES);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listPages(), id === null ? null : getAdminSubject(id)])
      .then(([pages, subject]) => {
        if (!active) return;
        const pageOptions = toPageOptions(pages);
        setValues(
          subject
            ? toSubjectValues(subject)
            : { ...EMPTY_SUBJECT_VALUES, page_ID: pageOptions[0]?.value ?? '' },
        );
        setLoad({ status: 'ready', pageOptions });
      })
      .catch((failure: unknown) => {
        if (active) setLoad({ status: 'error', message: loadMessage(failure) });
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
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
      const input = toSubjectInput(values);
      if (id === null) {
        await createSubject(input);
      } else {
        await updateSubject(id, input);
      }
      onSaved();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The server could not be reached.');
      setSaving(false);
    }
  };

  return { load, values, error, saving, handleChange, handleSubmit };
}

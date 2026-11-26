import { ChangeEvent, FormEvent, useState } from 'react';
import { ApiError } from '../api/client';
import { Credentials } from '../types/api';
import { useAuth } from './useAuth';

export function useLoginForm() {
  const { signIn } = useAuth();
  const [values, setValues] = useState<Credentials>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (values.username === '' || values.password === '') {
      setError('Enter your username and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(values);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The server could not be reached.');
      setSubmitting(false);
    }
  };

  return { values, error, submitting, handleChange, handleSubmit };
}

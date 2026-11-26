import { useState } from 'react';
import { ApiError } from '../api/client';

export function useDeleteAction(remove: () => Promise<void>, onDeleted: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await remove();
      onDeleted();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The server could not be reached.');
      setDeleting(false);
    }
  };

  return { deleting, error, handleDelete };
}

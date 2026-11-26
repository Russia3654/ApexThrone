import { useState } from 'react';
import { deletePage } from '../api/adminPagesApi';
import { ApiError } from '../api/client';

export function useDeletePage(id: number, onDeleted: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePage(id);
      onDeleted();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The server could not be reached.');
      setDeleting(false);
    }
  };

  return { deleting, error, handleDelete };
}

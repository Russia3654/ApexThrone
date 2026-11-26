import { useState } from 'react';
import { useAuth } from './useAuth';

export function useSignOut() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await signOut();
    } catch {
      setFailed(true);
      setBusy(false);
    }
  };

  return { busy, failed, handleSignOut };
}

import { useAuth } from '../../hooks/useAuth';
import { useSignOut } from '../../hooks/useSignOut';
import Button from '../ui/Buttons/Button';

export default function AdminUserMenu() {
  const { state } = useAuth();
  const { busy, failed, handleSignOut } = useSignOut();

  if (state.status !== 'authenticated') {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {failed && (
        <p role="alert" className="text-sm text-crimson">
          Sign out failed. Try again.
        </p>
      )}
      <span className="text-ink-muted">
        {state.admin.first_name} {state.admin.last_name}
      </span>
      <Button variant="danger" onClick={handleSignOut} disabled={busy}>
        Sign out
      </Button>
    </div>
  );
}

import { Navigate } from 'react-router-dom';
import Button from '../../../components/ui/Buttons/Button';
import TextField from '../../../components/ui/Forms/TextField';
import { useAuth } from '../../../hooks/useAuth';
import { useLoginForm } from '../../../hooks/useLoginForm';

export default function AdminLogin() {
  const { state } = useAuth();
  const { values, error, submitting, handleChange, handleSubmit } = useLoginForm();

  if (state.status === 'authenticated') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-ink">
      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-gold">
          Admin sign in
        </h1>
        <TextField
          label="Username"
          name="username"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
        />
        {error && (
          <p role="alert" className="text-sm text-crimson">
            {error}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </main>
  );
}

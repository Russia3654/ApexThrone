import { Outlet } from 'react-router-dom';
import { useMenu } from '../../hooks/useMenu';
import PublicFooter from './PublicFooter';
import PublicNavbar from './PublicNavbar';

export default function PublicLayout() {
  const { links, status } = useMenu();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PublicNavbar links={links} />
      {status === 'loading' && (
        <p role="status" className="sr-only">
          Loading menu
        </p>
      )}
      {status === 'error' && (
        <p role="alert" className="px-6 py-2 text-center text-sm text-crimson">
          The menu could not be loaded. Please reload the page.
        </p>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <PublicFooter links={links} />
    </div>
  );
}

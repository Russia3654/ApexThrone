import { Outlet } from 'react-router-dom';
import PublicFooter from './PublicFooter';
import PublicNavbar from './PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PublicNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

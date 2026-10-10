import { Outlet } from 'react-router-dom';
import PublicFooter from './PublicFooter';
import PublicNavbar from './PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

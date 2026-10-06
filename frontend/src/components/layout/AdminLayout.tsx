import { NavLink, Outlet } from 'react-router-dom';

type LinksType = {
  to: string;
  label: string;
  end: boolean;
};

const base =
  'block px-6 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';
const inactiveClassName = 'text-ink-muted hover:bg-surface-2 hover:text-ink';
const activeClassName = 'border-l-2 border-gold bg-surface-2 text-gold';

const links: LinksType[] = [
  { to: '/admin', label: 'Menu', end: true },
  { to: '/admin/subjects', label: 'Subjects', end: false },
  { to: '/admin/pages', label: 'Pages', end: false },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink md:flex-row">
      <aside className="w-full shrink-0 border-b border-surface-2 bg-surface md:w-64 md:border-b-0 md:border-r">
        <p className="px-6 py-5 font-display text-2xl font-bold uppercase tracking-widest text-gold">
          ApexThrone
        </p>
        <nav aria-label="Admin navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `${base} ${isActive ? activeClassName : inactiveClassName}`
              }
              to={link.to}
              end={link.end}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-surface-2 bg-surface px-6 py-5">
          ApexThrone SuperAdmin Panel
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <footer className="border-t border-surface-2 px-6 py-4 text-sm text-ink-muted">
          &copy; 2026 ApexThrone. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;

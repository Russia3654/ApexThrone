import { Link, NavLink } from 'react-router-dom';
import { links } from '../../utils/navLinks';
import LinkButton from '../ui/Links/LinkButton';

const BASE =
  'font-display uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';
const INACTIVE_CLASS = 'text-ink-muted hover:text-ink';
const ACTIVE_CLASS = 'text-gold';

export default function PublicNavbar() {
  return (
    <header className="border-b border-surface-2 bg-bg">
      <nav
        className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-4"
        aria-label="Main"
      >
        <ul className="flex items-center gap-6">
          <li>search</li>
          {links.slice(0, 2).map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) => `${BASE} ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`}
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link
          className="font-display text-3xl font-bold tracking-widest text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          to="/"
          aria-label="ApexThrone home"
        >
          AT
        </Link>
        <ul className="flex items-center justify-end gap-6">
          {links.slice(2).map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) => `${BASE} ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`}
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <LinkButton to="/login">Sign in</LinkButton>
          </li>
        </ul>
      </nav>
    </header>
  );
}

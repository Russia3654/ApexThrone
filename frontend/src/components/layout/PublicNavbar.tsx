import { Link, NavLink } from 'react-router-dom';
import { links } from '../../utils/navLinks';
import LinkButton from '../ui/Links/LinkButton';
import logo from '../../assets/ApexThrone.png';
import { useRef, useState, KeyboardEvent } from 'react';

const BASE =
  'font-display uppercase tracking-wider focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';
const INACTIVE_CLASS = 'text-ink-muted hover:text-ink';
const ACTIVE_CLASS = 'text-gold';

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && open) {
      handleClose();
      buttonRef.current?.focus();
    }
  };

  return (
    <header onKeyDown={handleKeyDown} className="relative z-20 border-b border-surface-2 bg-bg">
      <nav
        className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-4"
        aria-label="Main"
      >
        <ul className="flex items-center gap-6">
          <li className="md:hidden">
            <button
              type="button"
              ref={buttonRef}
              aria-expanded={open}
              aria-controls="menu"
              onClick={handleToggle}
              className="font-display uppercase tracking-wider text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Menu
            </button>
          </li>
          <li className="hidden md:block">
            <button type="button" disabled aria-label="Search (coming soon)">
              Search
            </button>
          </li>
          {links.slice(0, 2).map((link) => (
            <li key={link.to} className="hidden md:block">
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
          className="relative -mb-10 -mt-4 flex h-24 w-40 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          to="/"
          aria-label="ApexThrone home"
        >
          <span className="absolute inset-0 bg-gradient-to-b from-surface-2 to-surface [clip-path:polygon(0_0,100%_0,82%_100%,18%_100%)]" />
          <img src={logo} alt="" className="relative h-16 w-auto" />
        </Link>
        <ul className="flex items-center justify-end gap-6">
          {links.slice(2).map((link) => (
            <li key={link.to} className="hidden md:block">
              <NavLink
                className={({ isActive }) => `${BASE} ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`}
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="whitespace-nowrap">
            <LinkButton to="/login">Sign in</LinkButton>
          </li>
        </ul>
      </nav>
      {open && (
        <div id="menu" className="border-t border-surface-2 bg-surface px-6 py-4 md:hidden">
          <ul className="mx-auto max-w-6xl space-y-1">
            {links.map((link) => (
              <li key={link.to} className="block py-2">
                <NavLink
                  className={({ isActive }) =>
                    `${BASE} ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}`
                  }
                  to={link.to}
                  onClick={handleClose}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

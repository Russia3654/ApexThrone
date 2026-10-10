import { Link } from 'react-router-dom';
import { links } from '../../utils/navLinks';

export default function PublicFooter() {
  return (
    <footer className="border-t border-surface-2 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-ink-muted md:flex-row md:justify-between">
        <div className="font-display text-lg font-bold uppercase tracking-widest text-gold">
          ApexThrone
        </div>
        <nav aria-label="Footer">
          <ul className="flex gap-6">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  className="hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  to={link.to}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>&copy; 2026 ApexThrone. All rights reserved.</div>
      </div>
    </footer>
  );
}

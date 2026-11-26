import { Link } from 'react-router-dom';
import { MenuItem } from '../../../types/api';

type SubpageListProps = {
  subpages: MenuItem[];
};

export default function SubpageList({ subpages }: SubpageListProps) {
  return (
    <nav aria-label="Subpages">
      <ul className="flex flex-wrap gap-4">
        {subpages.map((item) => (
          <li key={item.slug}>
            <Link
              className="font-display uppercase tracking-wider text-ink-muted hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              to={`/${item.slug}`}
            >
              {item.menu_name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

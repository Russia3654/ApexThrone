import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type BackLinkProps = {
  to: string;
  children: ReactNode;
};

const BASE =
  'inline-block text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold';

const BackLink = ({ to, children }: BackLinkProps) => {
  return (
    <Link to={to} className={BASE}>
      {children}
    </Link>
  );
};

export default BackLink;

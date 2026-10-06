import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ButtonVariant = 'primary' | 'danger';

type LinkButtonProps = {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

const BASE =
  'inline-block cut-corners px-4 py-2 font-display font-bold uppercase tracking-wider text-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gold hover:shadow-glow-gold',
  danger: 'bg-crimson hover:shadow-glow-red',
};

const LinkButton = ({ to, children, variant = 'primary' }: LinkButtonProps) => {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]}`}>
      {children}
    </Link>
  );
};

export default LinkButton;

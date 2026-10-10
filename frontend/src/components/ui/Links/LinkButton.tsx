import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ButtonVariant } from '../../../types/ui';
import { BASE, VARIANTS } from '../../../utils/buttonStyles';

type LinkButtonProps = {
  to: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

const LinkButton = ({ to, children, variant = 'primary' }: LinkButtonProps) => {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]}`}>
      {children}
    </Link>
  );
};

export default LinkButton;

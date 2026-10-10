import { ButtonType, ButtonVariant } from '../../../types/ui';
import { BASE, VARIANTS } from '../../../utils/buttonStyles';

type ButtonProps = {
  type?: ButtonType;
  children: string;
  variant?: ButtonVariant;
  onClick?: () => void;
};
const Button = ({ type = 'button', children, variant = 'primary', onClick }: ButtonProps) => {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

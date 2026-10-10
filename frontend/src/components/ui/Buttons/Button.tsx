import { ButtonType, ButtonVariant } from '../../../types/ui';
import { BASE, VARIANTS } from '../../../utils/buttonStyles';

type ButtonProps = {
  type?: ButtonType;
  children: string;
  variant?: ButtonVariant;
};
const Button = ({ type = 'button', children, variant = 'primary' }: ButtonProps) => {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]}`}>
      {children}
    </button>
  );
};

export default Button;

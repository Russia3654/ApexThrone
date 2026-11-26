import { ButtonType, ButtonVariant } from '../../../types/ui';
import { BASE, VARIANTS } from '../../../utils/buttonStyles';

type ButtonProps = {
  type?: ButtonType;
  children: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
};
const Button = ({
  type = 'button',
  children,
  variant = 'primary',
  onClick,
  disabled,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} disabled:opacity-60`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

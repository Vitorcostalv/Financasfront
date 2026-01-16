import { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-app-accent text-slate-900 hover:bg-app-accent/90',
  secondary: 'bg-app-panelAlt text-white hover:bg-app-panelAlt/80',
  ghost: 'bg-transparent text-slate-200 hover:bg-app-panelAlt/60',
  danger: 'bg-orange-500 text-slate-900 hover:bg-orange-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

const Button = ({
  children,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) => (
  <button
    className={`rounded-xl font-medium transition ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;

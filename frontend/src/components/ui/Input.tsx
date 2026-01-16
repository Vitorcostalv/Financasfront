import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <label className="block space-y-2 text-sm">
    {label && <span className="app-label">{label}</span>}
    <input className={`app-input ${className}`} {...props} />
    {error && <span className="text-xs text-orange-300">{error}</span>}
  </label>
);

export default Input;

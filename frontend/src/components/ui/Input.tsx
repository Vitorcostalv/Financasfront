import { InputHTMLAttributes } from 'react';
import HelpTooltip from './HelpTooltip';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  help?: string;
  error?: string;
};

const Input = ({ label, help, error, className = '', ...props }: InputProps) => (
  <label className="block space-y-2 text-sm">
    {label && (
      <span className="flex items-center gap-2">
        <span className="app-label">{label}</span>
        {help && <HelpTooltip text={help} label={`Ajuda sobre ${label}`} />}
      </span>
    )}
    <input className={`app-input ${className}`} {...props} />
    {error && <span className="text-xs text-orange-300">{error}</span>}
  </label>
);

export default Input;

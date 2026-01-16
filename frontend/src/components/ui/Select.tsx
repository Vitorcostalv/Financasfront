import { SelectHTMLAttributes } from 'react';
import HelpTooltip from './HelpTooltip';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  help?: string;
  error?: string;
};

const Select = ({ label, help, error, className = '', children, ...props }: SelectProps) => (
  <label className="block space-y-2 text-sm">
    {label && (
      <span className="flex items-center gap-2">
        <span className="app-label">{label}</span>
        {help && <HelpTooltip text={help} label={`Ajuda sobre ${label}`} />}
      </span>
    )}
    <select className={`app-input ${className}`} {...props}>
      {children}
    </select>
    {error && <span className="text-xs text-orange-300">{error}</span>}
  </label>
);

export default Select;

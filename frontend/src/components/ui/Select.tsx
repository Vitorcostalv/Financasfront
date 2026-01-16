import { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

const Select = ({ label, error, className = '', children, ...props }: SelectProps) => (
  <label className="block space-y-2 text-sm">
    {label && <span className="app-label">{label}</span>}
    <select className={`app-input ${className}`} {...props}>
      {children}
    </select>
    {error && <span className="text-xs text-orange-300">{error}</span>}
  </label>
);

export default Select;

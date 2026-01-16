import { ReactNode } from 'react';

type CardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
};

const Card = ({ title, action, children }: CardProps) => (
  <div className="app-card space-y-4">
    {(title || action) && (
      <div className="flex items-center justify-between">
        {title && <h3 className="text-sm uppercase tracking-[0.25em] text-app-muted">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </div>
);

export default Card;
